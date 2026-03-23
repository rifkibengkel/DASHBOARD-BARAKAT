import { query } from "@/lib/db/postgres";
import { BaseQueryResult } from "@/types";
import { QueryResult } from "pg";

export async function getPrize() {
  const whereClause: string[] = ["P.status = 1"];

  const result: QueryResult = await query(
    `
        SELECT
            P.id,
            P.name,
            PT.id AS "typeId",
            COUNT(CASE WHEN A.status = 0 THEN A."prizeId" END) AS "availablePrize",
            COUNT(CASE WHEN A.status = 1 THEN A."prizeId" END) AS "claimedPrize",
            COUNT(A."prizeId") as "totalPrize"
        FROM prize P
        LEFT JOIN allocation A ON A."prizeId" = P.id
        LEFT JOIN prize_type PT ON PT.id = P."typeId"
        WHERE ${whereClause.join(" AND ")} AND p.is_show = true
        GROUP BY P.id, P.name, PT.id
        ORDER BY P.id ASC;
        `
    // `
    //   SELECT
    //   P.id,
    //   P.name AS hadiah,
    //   PT.id AS "typeId",
    //   P.quantity,
    //   REPLACE(
    //     TO_CHAR(
    //       COALESCE(NULLIF(P.amount, '')::numeric, 0),
    //       'FM999,999,999,999'
    //     ),
    //     ',',
    //     '.'
    //   ) AS satuan,
    //   REPLACE(
    //     TO_CHAR(
    //       COALESCE(NULLIF(P.amount, '')::numeric, 0)
    //       * COALESCE(P.quantity, 0),
    //       'FM999,999,999,999'
    //     ),
    //     ',',
    //     '.'
    //   ) AS total
    //   FROM prize P
    //   LEFT JOIN prize_type PT ON PT.id = P."typeId"
    //   WHERE ${whereClause.join(" AND ")} AND P.is_show = true
    //   GROUP BY
    //   P.id,
    //   P.name,
    //   PT.id,
    //   P.quantity,
    //   P.amount
    //   ORDER BY P.id ASC;
    // `
  );

  return result.rows as (BaseQueryResult & {
    claimedPrize: number;
    availablePrize: number;
    totalPrize: number;
  })[];
}
