import { QueryResult } from "pg";
import { query } from "@/lib/db/postgres";
import { BaseQueryResult, Menu } from "@/types";

export async function getMedia() {
  const result: QueryResult = await query(
    `
        SELECT
        id,
        name,
        code
        FROM media
        WHERE
            status = 1
        `,
  );

  return result.rows as { id: number; name: string; code: number }[];
}

export async function getPromo() {
  const result: QueryResult = await query(
    `
        SELECT
            "periode_start",
            "periode_end"
        FROM periode
        WHERE 
            status = 1
        `,
  );

  return result.rows[0] as { periode_start: string; periode_end: string };
}

export async function getInvalidReason() {
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name,
            status
        FROM invalid_reason
        WHERE status = 1
        ORDER BY id ASC
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getInvalidReasonById(id: number) {
  const result: QueryResult = await query(
    `
        SELECT
            id,
            name
        FROM invalid_reason
        WHERE id = $1
        `,
    [id],
  );

  return result.rows[0] as BaseQueryResult;
}

export async function getMasterParameterById(id: number) {
  const result: QueryResult = await query(
    `
        SELECT
            id, 
            description, 
            value 
        FROM general_parameter
        WHERE id = $1
        `,
    [id],
  );

  return result.rows[0] as {
    id: number;
    name: string;
    description: string;
    value: string;
  };
}

export async function getMasterParameterByName(name: string) {
  const result: QueryResult = await query(
    `
        SELECT
            id, 
            name,
            description, 
            value 
        FROM general_parameter
        WHERE name = $1
        `,
    [name],
  );

  return result.rows[0] as {
    id: number;
    name: string;
    description: string;
    value: string;
  };
}

export async function getMenu(username: string) {
  const result: QueryResult = await query(
    `
           SELECT 
                E.id AS "id",
                E.description AS "menu",
                E.path,
                E.level,
                E.header AS "sub",
                E.icon,
                D.m_insert,
                D.m_update,
                D.m_delete,
                D.m_view
            FROM user_mobile A
            INNER JOIN "access" C ON A."accessId" = C.id
            INNER JOIN access_det D ON C.id = D."accessId" AND D.m_view = 1
            INNER JOIN menu E ON D."menuId" = E.id AND  E.status = 1
            WHERE A.username = $1
            ORDER BY E.sort;
        `,
    [username],
  );

  return result.rows as Menu[];
}

export async function getPrize(type?: "physic" | "digital") {
  let whereClause = "";
  if (type) {
    whereClause = `AND "isTopup" = ${type === "physic" ? 0 : 1}`;
  }
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name
        FROM prize
        WHERE status = 1 ${whereClause}
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getPrizeCategory() {
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name
        FROM prize_category
        WHERE status = 1
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getProduct() {
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name
        FROM product
        WHERE status = 1
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getRegion() {
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name
        FROM regions
        WHERE status = 1
        ORDER BY sort ASC
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getStore() {
  const result: QueryResult = await query(
    `
        SELECT 
            id,
            name
        FROM store
        WHERE status = 1
        ORDER BY sort ASC
        `,
  );

  return result.rows as BaseQueryResult[];
}

export async function getAllocation() {
  const result: QueryResult = await query(
    `
    SELECT COUNT(*)::int AS total
    FROM allocation
    WHERE allocation_date < NOW()
    `,
    [],
  );
  return result.rows[0].total as number;
}
