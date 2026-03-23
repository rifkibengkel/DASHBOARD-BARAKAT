import { query, withTransaction } from "@/lib/db/postgres";
import { Filter, UsersList, Pagination } from "@/types";

export async function getBlackList(params: Filter & Pagination) {
  const { key, column, direction, page, limit } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["id", "name", "sender", "id_number"];
  const orderColumn = validColumns.includes(column || "") ? column : "id";
  const orderDirection = direction?.toLowerCase() === "desc" ? "DESC" : "ASC";

  const whereClauses: string[] = ["1=1", "U.is_deleted = 0"];
  const queryParams: (number | string)[] = [];

  if (searchKey) {
    queryParams.push(searchKey);
    whereClauses.push(
      `U.name ILIKE $${queryParams.length} OR U.sender ILIKE $${queryParams.length} OR U.id_number ILIKE $${queryParams.length}`
    );
  }

  const sql = `
        SELECT
            U.id,
            U.name,
            U.sender,
            U.id_number,
            U.status,
            CASE
                WHEN U.status = 0 THEN 'inactive'
                WHEN U.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text",
            COUNT(*) OVER()::int AS "totalData"
        FROM black_list U
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY U.${orderColumn} ${orderDirection}
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

export async function getBlackListById(id: number) {
  if (!id) throw new Error("getBlackList requires a valid ID");

  const result = await query(
    `
        SELECT
            U.id,
            U.name,
            U.sender,
            U.id_number,
            U.status,
            CASE
                WHEN U.status = 0 THEN 'inactive'
                WHEN U.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text"
        FROM black_list U
        WHERE U.id = $1
        ORDER BY U.id;
        `,
    [id]
  );

  return result.rows[0] as UsersList;
}

export async function insertBlackList({
  userId,
  blacklist,
}: {
  userId: number;
  blacklist: Omit<UsersList, "status_text">;
}) {
  return withTransaction(async (client) => {
    const params = [
      blacklist.name,
      blacklist.sender,
      blacklist.id_number,
      blacklist.status,
      userId,
    ];

    await client.query(
      `
            DELETE FROM white_list
            WHERE sender = $1;
            `,
      [blacklist.sender]
    );

    const result = await client.query(
      `
            INSERT INTO black_list (name, sender, id_number, status, "createdById")
            VALUES ($1,$2,$3,$4,$5);
            `,
      params
    );

    return result.rows[0] as UsersList;
  });
}

export async function updateBlackList({
  id,
  userId,
  blacklist,
}: {
  id: number;
  userId: number;
  blacklist: Omit<UsersList, "status_text">;
}) {
  return withTransaction(async (client) => {
    const params = [
      blacklist.name,
      blacklist.sender,
      blacklist.id_number,
      blacklist.status,
      userId,
      id,
    ];

    const result = await client.query(
      `
            UPDATE black_list
            SET 
              name = $1, 
              sender = $2, 
              id_number = $3, 
              status = $4, 
              updated_at = NOW(),
              "updatedById" = $5
            WHERE id = $6;
        `,
      params
    );

    return result.rows[0] as UsersList;
  });
}

export async function deleteBlackList({
  id,
  userId,
}: {
  id: number;
  userId: number;
}) {
  return withTransaction(async (client) => {
    const params = [userId, id];

    const result = await client.query(
      `
            UPDATE black_list
            SET 
                status = 0,
                is_deleted = 1,
                updated_at = NOW(),
                "deletedById" = $1
            WHERE id = $2;
        `,
      params
    );

    return result.rows[0] as UsersList;
  });
}
