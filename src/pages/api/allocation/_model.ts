import { query, withTransaction } from "@/lib/db/postgres";
import { Filter, Allocation, Pagination } from "@/types";

export async function getAllocation(params: Filter & Pagination) {
  const { key, column, direction, page, limit } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["allocation_date"];
  const orderColumn = validColumns.includes(column || "")
    ? column
    : "allocation_date";
  const orderDirection = direction?.toLowerCase() === "desc" ? "DESC" : "ASC";

  const whereClauses: string[] = ["1=1"];
  const queryParams: (number | string)[] = [];

  if (searchKey) {
    queryParams.push(searchKey);
    whereClauses.push(`P.name ILIKE $${queryParams.length}`);
  }

  const sql = `
       SELECT
            A.allocation_date,
            P.name AS prize,
            COALESCE(R.name, 'All') AS region,
            COALESCE(S.name, 'All') AS store,
            COUNT(*) FILTER (WHERE A.status = 0) AS allocation_unused,
            COUNT(*) FILTER (WHERE A.status = 1) AS allocation_used,
            COUNT(*) AS allocation_total,
            ROUND(
                (COUNT(*) FILTER (WHERE A.status = 1) * 100.0) / NULLIF(COUNT(*), 0),
                2
            ) AS allocation_percentage,
            COUNT(*) AS "totalData"
        FROM
            allocation A
        LEFT JOIN
            prize P ON A."prizeId" = P.id
        LEFT JOIN
            regions R ON A."regionId" = R.id
        LEFT JOIN
            store S ON A."storeId" = S.id
        WHERE P."typeId" = 1 AND ${whereClauses.join(" AND ")}
        GROUP BY
            A.allocation_date,
            P.name,
            R.name,
            S.name
        ORDER BY A.${orderColumn} ${orderDirection}
        LIMIT $${queryParams.length + 1}
        OFFSET $${queryParams.length + 2}
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (Allocation & { totalData: number })[];

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

export async function insertAllocation({
  allocation_date,
  prizeId,
  quantity,
  regionId,
  storeId,
}: {
  allocation_date: string;
  prizeId: string | number;
  quantity: string | number;
  regionId?: string | number;
  storeId?: string | number;
}) {
  return withTransaction(async (client) => {
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new Error("Quantity must be a positive number");
    }

    const query = `
            INSERT INTO allocation ("prizeId", allocation_date, "regionId", "storeId")
            VALUES ${Array.from({ length: qty })
              .map(
                (_, i) =>
                  `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`,
              )
              .join(", ")}
            RETURNING id;
            `;

    await client.query(
      query,
      Array(qty)
        .fill(prizeId)
        .flatMap((v) => [
          v,
          allocation_date,
          regionId || null,
          storeId || null,
        ]),
    );

    return true;
  });
}
