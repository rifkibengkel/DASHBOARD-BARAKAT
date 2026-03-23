import { query, withTransaction } from "@/lib/db/postgres";
import { Filter, UsersList, Pagination } from "@/types";

export async function getWhiteList(params: Filter & Pagination) {
  const { key, column, direction, page, limit } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["id", "name", "sender", "id_number"];
  const orderColumn = validColumns.includes(column || "")
    ? column
    : "updated_at";
  const orderDirection = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

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
        FROM white_list U
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

export async function getWhiteListById(id: number) {
  if (!id) throw new Error("getMenuById requires a valid ID");

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
        FROM white_list U
        WHERE U.id = $1
        ORDER BY U.id;
        `,
    [id]
  );

  return result.rows[0] as UsersList;
}

export async function insertWhiteList({
  userId,
  whitelist,
}: {
  userId: number;
  whitelist: Omit<UsersList, "status_text">;
}) {
  return withTransaction(async (client) => {
    const params = [
      whitelist.name,
      whitelist.sender,
      whitelist.id_number,
      whitelist.status,
      userId,
    ];

    await client.query(
      `
            DELETE FROM black_list
            WHERE sender = $1;
            `,
      [whitelist.sender]
    );

    const result = await client.query(
      `
            INSERT INTO white_list (name, sender, id_number, status, "createdById")
            VALUES ($1,$2,$3,$4,$5);
            `,
      params
    );

    return result.rows[0] as UsersList;
  });
}

export async function updateWhiteList({
  id,
  userId,
  whitelist,
}: {
  id: number;
  userId: number;
  whitelist: Omit<UsersList, "status_text">;
}) {
  return withTransaction(async (client) => {
    const params = [
      whitelist.name,
      whitelist.sender,
      whitelist.id_number,
      whitelist.status,
      userId,
      id,
    ];

    const result = await client.query(
      `
            UPDATE white_list
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

export async function deleteWhiteList({
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
            UPDATE white_list
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
