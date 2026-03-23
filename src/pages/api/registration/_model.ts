import { query } from "@/lib/db/postgres";
import { Filter, Pagination, RegistrationData } from "@/types";
import dayjs from "dayjs";

export async function getRegistrationData(params: Filter & Pagination) {
  const { key, column, direction, page, limit, startDate, endDate } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["id", "name", "sender", "id_number"];
  const orderColumn = validColumns.includes(column || "")
    ? column
    : "updated_at";
  const orderDirection = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereClauses: string[] = ["1=1", "A.is_deleted = 0"];
  const queryParams: (number | string)[] = [];

  let dateParamIndexStart: number | null = null;
  let dateParamIndexEnd: number | null = null;
  let nextParamIndex = 1;

  if (searchKey) {
    queryParams.push(searchKey);
    whereClauses.push(
      `(A.fullname ILIKE $${nextParamIndex} OR A.identity ILIKE $${nextParamIndex} OR A.hp ILIKE $${nextParamIndex} OR A.regency_ktp ILIKE $${nextParamIndex})`
    );
    nextParamIndex++;
  }

  if (startDate && endDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    dateParamIndexStart = nextParamIndex;
    dateParamIndexEnd = nextParamIndex + 1;

    whereClauses.push(
      `A.updated_at BETWEEN $${dateParamIndexStart} AND $${dateParamIndexEnd}`
    );
    nextParamIndex += 2;
  } else if (startDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    dateParamIndexStart = nextParamIndex;

    whereClauses.push(`A.updated_at >= $${dateParamIndexStart}`);
    nextParamIndex++;
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    dateParamIndexEnd = nextParamIndex;

    whereClauses.push(`A.updated_at <= $${dateParamIndexEnd}`);
    nextParamIndex++;
  }

  const countWhereClauses = ["1=1", "A2.is_deleted = 0"];
  const searchParamIndex = 1;

  if (searchKey) {
    countWhereClauses.push(
      `(A2.fullname ILIKE $${searchParamIndex} OR A2.identity ILIKE $${searchParamIndex} OR A2.hp ILIKE $${searchParamIndex} OR A2.regency_ktp ILIKE $${searchParamIndex})`
    );
  }

  if (dateParamIndexStart && dateParamIndexEnd) {
    countWhereClauses.push(
      `A2.updated_at BETWEEN $${dateParamIndexStart} AND $${dateParamIndexEnd}`
    );
  } else if (dateParamIndexStart) {
    countWhereClauses.push(`A2.updated_at >= $${dateParamIndexStart}`);
  } else if (dateParamIndexEnd) {
    countWhereClauses.push(`A2.updated_at <= $${dateParamIndexEnd}`);
  }

  const limitParamIndex = nextParamIndex;
  const offsetParamIndex = nextParamIndex + 1;

  const sql = `
      SELECT 
            *,
            (SELECT COUNT(DISTINCT A2.id) 
              FROM users A2 
              LEFT JOIN entries ON entries."userId" = A2.id
              LEFT JOIN media ON A2."mediaId" = media.id
              LEFT JOIN user_mobile ON user_mobile."userId" = A2.id 
              WHERE ${countWhereClauses.join(" AND ")}) AS "totalData"
      FROM (
          SELECT 
                 A.updated_at AS created_at, 
                 (CASE WHEN A.fullname IS NOT NULL AND A.fullname != '' THEN A.fullname ELSE '-' END) AS fullname,
                 (CASE WHEN A.gender = 'M' THEN 'LAKI - LAKI' WHEN A.gender = 'F' THEN 'PEREMPUAN' ELSE '-' END) AS gender,
                 (CASE WHEN A.identity IS NOT NULL AND A.identity != '' THEN A.identity ELSE '-' END) AS identity,
                 A.age, 
                 A.birthdate, 
                 A.hp, 
                 A.regency_ktp AS city,
                 media.name AS media,
                 user_mobile.id
             FROM users AS A
             LEFT JOIN entries ON entries."userId" = A.id
             LEFT JOIN media ON A."mediaId" = media.id
             LEFT JOIN user_mobile ON user_mobile."userId" = A.id
             WHERE ${whereClauses.join(" AND ")}
             GROUP BY A.id, A.updated_at, A.fullname, A.gender, A.identity, A.age, A.birthdate, A.hp, A.regency_ktp, media.name, user_mobile.id
             ORDER BY A.${orderColumn} ${orderDirection}
             LIMIT $${limitParamIndex}
             OFFSET $${offsetParamIndex}
      ) main_query
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (RegistrationData & { totalData: number })[];

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

export async function exportRegistration(params: Filter) {
  const { startDate, endDate } = params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (startDate && endDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(
      `A.updated_at BETWEEN $${queryParams.length - 1} AND $${
        queryParams.length
      }`
    );
  } else if (startDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(`A.updated_at >= $${queryParams.length}`);
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    whereClauses.push(`A.updated_at <= $${queryParams.length}`);
  }

  const result = await query(
    `
        SELECT 
            A.id AS "userId",
            A.created_at, 
            A.fullname,
            (CASE WHEN A.gender = 'M' THEN 'LAKI - LAKI' WHEN A.gender = 'F' THEN 'PEREMPUAN' ELSE '-' END) gender,
            A.identity, 
            A.age, 
            A.birthdate, 
            A.hp, 
            A.address,
            A.regency_ktp AS city,
            A.district AS district,
            D.name AS province
        FROM users AS A
        LEFT JOIN entries B ON B."userId" = A.id
        LEFT JOIN media C ON A."mediaId" = C.id
        LEFT JOIN province D ON A.province = D.code
        WHERE ${whereClauses.join(" AND ")} 
        GROUP BY A.id, C.name, D.name
    `,
    queryParams
  );

  return result.rows;
}
