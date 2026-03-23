import { getMongoDatabase } from "@/lib/db/mongo";
import { query, withTransaction } from "@/lib/db/postgres";
import { Filter, UsersList, Pagination, OptionList } from "@/types";
import { TestingDataDetail } from "@/types/developer-tools";

export async function getTestingData(params: Filter & Pagination) {
  const { key, column, direction, page, limit } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["id", "fullname", "hp"];
  const orderColumn = validColumns.includes(column || "") ? column : "id";
  const orderDirection = direction?.toLowerCase() === "desc" ? "DESC" : "ASC";

  const whereClauses: string[] = ["1=1", "U.is_deleted = 0"];
  const queryParams: (number | string)[] = [];

  if (searchKey) {
    queryParams.push(searchKey);
    whereClauses.push(
      `u.fullname ILIKE $${queryParams.length} OR u.hp ILIKE $${queryParams.length}`,
    );
  }

  const sql = `
        SELECT
          u.id,
          u.fullname AS name,
          u.hp AS sender,
          COUNT(DISTINCT e.id) AS entries,
          COUNT(DISTINCT w.id) AS winner,
          CASE
              WHEN u.status = 0 THEN 'inactive'
              WHEN u.status = 1 THEN 'active'
          ELSE 'unknown'
              END AS "status_text",
          COUNT(*) OVER()::int AS "totalData"
        FROM
          users u
          LEFT JOIN white_list wh ON wh.sender = u.hp
          LEFT JOIN attachment att ON att."userId" = u.id
          LEFT JOIN entries e ON e."userId" = u.id
          LEFT JOIN winner w ON w."userId" = u.id
          LEFT JOIN allocation al ON al.id = w."allocationId"
        WHERE ${whereClauses.join(" AND ")} AND wh.is_tester = 1
        GROUP BY
              u.id,
              u.fullname,
              u.hp
        ORDER BY u.${orderColumn} ${orderDirection}
        LIMIT $${queryParams.length + 1}
        OFFSET $${queryParams.length + 2}
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (UsersList & { totalData: number })[];

  const totalData = rows.length > 0 ? rows[0].totalData : 0;
  const totalPage = Math.ceil(totalData / Number(limit));

  return {
    list: rows,
    dataPerPage: Number(limit),
    currentPage: Number(page),
    totalData,
    totalPage,
  };
}

export async function getUserOption() {
  const result = await query(
    `
      SELECT
        CONCAT (B.fullname, ' - ', B.hp) AS name,
        B.id AS
      VALUE
      FROM
        white_list A
        RIGHT JOIN users B ON A.sender = B.hp
      WHERE
        A.status = 1
        AND A.is_tester = 0
      ORDER BY
        B.id;
    `,
  );

  return result.rows as OptionList[];
}

export async function getTesterData(id: string | number) {
  const result = await query(
    `
      SELECT
        u.fullname AS name,
        u.hp AS sender,
        COUNT(DISTINCT e.id) AS total_entries,
        COUNT(DISTINCT w.id) AS total_winner,
        COUNT(DISTINCT att.id) AS total_attachment,
        CASE
          WHEN u.status = 0 THEN
            'inactive'
          WHEN u.status = 1 THEN
            'active'
          ELSE
            'unknown'
        END AS "status_text"
      FROM
        users u
        LEFT JOIN attachment att ON att."userId" = u.id
        LEFT JOIN entries e ON e."userId" = u.id
        LEFT JOIN winner w ON w."userId" = u.id
        LEFT JOIN allocation al ON al.id = w."allocationId"
      WHERE
        u.id = $1
      GROUP BY
        u.id,
        u.fullname,
        u.hp
        `,
    [id],
  );
  return result.rows[0] as Pick<
    TestingDataDetail,
    "name" | "sender" | "total_entries" | "total_winner" | "total_attachment"
  >;
}

export async function getTesterDataDetail(id: string | number) {
  const result = await query(
    `
      SELECT DISTINCT ON
        (e.id) e.rcvd_time,
        w.created_at,
        e.coupon,
        p."name" as prize
      FROM
        users u
        LEFT JOIN entries e ON e."userId" = u.id
        LEFT JOIN winner w ON w."userId" = u.id
        LEFT JOIN prize p ON p.id = w."prizeId"
      WHERE
        u.id = $1
        AND e."invalidReasonId" IS NULL
      ORDER BY
        e.id,
        w.created_at DESC;
        `,
    [id],
  );

  return result.rows;
}

export async function insertTestingData({
  userId,
  id,
}: {
  userId: number;
  id: number;
}) {
  return withTransaction(async (client) => {
    const params = [userId, id];

    const result = await client.query(
      `
        UPDATE white_list wl
        SET is_tester = 1,
        "updatedById" = $1
        FROM
          users u
        WHERE
          wl.sender = u.hp
          AND u.id = $2;
      `,
      params,
    );

    return result.rows[0] as UsersList;
  });
}

export async function updateTestingData({
  userId,
  id,
}: {
  userId: number;
  id: number;
}) {
  return withTransaction(async (client) => {
    const params = [userId, id];

    const result = await client.query(
      `
        UPDATE white_list wl
        SET is_tester = 0,
        "updatedById" = $1
        FROM
          users u
        WHERE
          wl.sender = u.hp
          AND u.id = $2;
      `,
      params,
    );

    return result.rows[0] as UsersList;
  });
}

export async function deleteTestingData({ userId }: { userId: number }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(`SELECT hp FROM users WHERE id = $1`, [
      userId,
    ]);
    if (rows.length === 0) {
      throw new Error("User not found");
    }
    const sender = rows[0].hp;
    await client.query(`UPDATE users SET "winnerId" = null WHERE id = $1;`, [
      userId,
    ]);
    await client.query(`DELETE FROM attachment WHERE "userId" = $1;`, [userId]);
    await client.query(
      `
      DELETE FROM transaction
      WHERE "winnerId" IN (
        SELECT w.id FROM winner w WHERE w."userId" = $1
      );
      `,
      [userId],
    );
    await client.query(`DELETE FROM winner WHERE "userId" = $1;`, [userId]);
    await client.query(
      `
      DELETE FROM allocation
      WHERE id IN (
        SELECT w."allocationId"
        FROM winner w
        WHERE w."userId" = $1
      );
      `,
      [userId],
    );
    await client.query(`DELETE FROM entries WHERE "userId" = $1;`, [userId]);
    await client.query(`DELETE FROM users WHERE id = $1;`, [userId]);

    // ---------- UPDATE / DELETE MONGO ----------
    try {
      const db = await getMongoDatabase();
      await db
        .collection("coupon")
        .updateMany(
          { sender },
          { $set: { status: 0, sender: null, use_date: null } },
        );
      await db.collection("user_session").deleteMany({ sender });
    } catch (error) {
      console.error("Failed to update MongoDB:", error);
      throw new Error("Failed to update MongoDB");
    }

    return { success: true };
  });
}
