import { query } from "@/lib/db/postgres";
import { Filter, Pagination, ConsumerData } from "@/types";
import dayjs from "dayjs";

export async function getConsumerData(params: Filter & Pagination) {
  const { key, column, direction, page, limit, startDate, endDate } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const searchKey = key ? `%${key}%` : null;

  const validColumns = ["id", "name", "sender", "id_number"];
  const orderColumn = validColumns.includes(column || "")
    ? column
    : "created_at";
  const orderDirection = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const whereClauses: string[] = ["1=1", "u.is_deleted = 0"];
  const queryParams: (number | string)[] = [];

  if (searchKey) {
    queryParams.push(searchKey);
    whereClauses.push(
      `(u.fullname ILIKE $${queryParams.length} OR u.hp ILIKE $${queryParams.length} OR u.identity ILIKE $${queryParams.length})`
    );
  }

  if (startDate && endDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(
      `u.updated_at BETWEEN $${queryParams.length - 1} AND $${
        queryParams.length
      }`
    );
  } else if (startDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(`u.updated_at >= $${queryParams.length}`);
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    whereClauses.push(`u.updated_at <= $${queryParams.length}`);
  }

  const sql = `
      WITH filtered_data AS (
          SELECT 
                u.updated_at AS created_at,
                u.hp,
                COALESCE(u.fullname, '-') AS fullname,
                u.identity,
                u.regency_ktp AS city,
                SUM(
                    CASE 
                        WHEN e.is_valid = 1
                        THEN 1 ELSE 0 
                    END
                ) AS total_submit_valid,
                SUM(
                    CASE 
                        WHEN e.is_valid = 0
                    THEN 1 ELSE 0 
                END) AS total_submit_invalid,
                COUNT(
                    CASE 
                        WHEN e.is_valid IN (0, 1)
                        THEN 1 
                    END) AS total_submit,
                u.id
            FROM entries e
            LEFT JOIN users u ON e."userId" = u.id
            WHERE ${whereClauses.join(" AND ")}
            GROUP BY u.updated_at, u.hp, u.fullname, u.regency_ktp, u.id
      )
      SELECT 
            *,
            (SELECT COUNT(*) FROM filtered_data) AS "totalData"
      FROM filtered_data
      ORDER BY ${orderColumn} ${orderDirection}
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2}
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (ConsumerData & { totalData: number })[];

  const totalData = rows.length > 0 ? rows[0].totalData : 0;
  const totalPage = Math.ceil(totalData / Number(limit));

  const totalParams = [];
  const totalWhereClauses = ["1=1", "u.is_deleted = 0"];

  if (searchKey) {
    totalParams.push(searchKey);
    totalWhereClauses.push(
      `(u.fullname ILIKE $${totalParams.length} OR u.hp ILIKE $${totalParams.length} OR u.identity ILIKE $${totalParams.length})`
    );
  }

  if (startDate && endDate) {
    totalParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    totalWhereClauses.push(
      `u.created_at BETWEEN $${totalParams.length - 1} AND $${
        totalParams.length
      }`
    );
  } else if (startDate) {
    totalParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    totalWhereClauses.push(`u.created_at >= $${totalParams.length}`);
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    totalWhereClauses.push(`u.created_at <= $${totalParams.length}`);
  }

  const totalSql = `
        SELECT 
            SUM(
                CASE 
                    WHEN e.is_valid = 1
                    THEN 1 ELSE 0 
                END
            ) AS total_submit_valid_sum,
            SUM(
                CASE 
                    WHEN e.is_valid = 0
                    THEN 1 ELSE 0 
                END
            ) AS total_submit_invalid_sum,
            
            COUNT(
                CASE 
                    WHEN e.is_valid IN (0, 1)
                    THEN 1 
                END
            ) AS total_submit_sum
        FROM entries e
        LEFT JOIN users u ON e."userId" = u.id
        WHERE ${totalWhereClauses.join(" AND ")}
    `;

  const totalResult = await query(totalSql, totalParams);
  const totalResultRow = totalResult.rows[0];

  const totalValidSum = Number(totalResultRow?.total_submit_valid_sum) || 0;
  const totalInvalidSum = Number(totalResultRow?.total_submit_invalid_sum) || 0;
  const totalSubmitSum = Number(totalResultRow?.total_submit_sum) || 0;

  const summaryRow: ConsumerData & { totalData: number } = {
    created_at: "",
    fullname: "",
    identity: "",
    hp: "",
    city: "",
    balance: "",
    total_submit_valid: totalValidSum,
    total_submit_invalid: totalInvalidSum,
    total_submit: totalSubmitSum,
    totalData: totalData,
  };

  rows.push(summaryRow);

  return {
    list: rows,
    dataPerPage: Number(limit),
    currentPage: Number(page),
    totalData,
    totalPage,
  };
}

export async function exportConsumerDataWithHistory(params: Filter) {
  const { startDate, endDate } = params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (startDate && endDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(
      `u.updated_at BETWEEN $${queryParams.length - 1} AND $${
        queryParams.length
      }`
    );
  } else if (startDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(`u.updated_at >= $${queryParams.length}`);
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    whereClauses.push(`u.updated_at <= $${queryParams.length}`);
  }
  const sql = `
        SELECT
            cr.created_at,
            cr."userId",
            U.fullname,
            U.hp,
            cr.coupon,
            cr.amount,
            cr.type,
            COALESCE(cr.topup_voucher,'') as topup_voucher,
            CASE
                WHEN cr.is_approved = 1 THEN 'approved'
                WHEN cr.is_approved = 2 THEN 'rejected'
                WHEN cr.is_approved = 0 THEN 'unprocessed'
                ELSE ''
            END AS approval_status,
            CASE
                WHEN cr.status = 0 THEN 'unprocessed'
                WHEN cr.status = 1 THEN 'processed'
                WHEN cr.status = 2 THEN 'success'
                WHEN cr.status = 3 THEN 'failed'
                ELSE ''
            END AS topup_status
        FROM (
            SELECT
                e.approved_date AS created_at,
                e.coupon,
                w.amount,
                'submit kode unik' AS type,
                w.id,
                NULL AS topup_voucher,
                e."userId",
                NULL AS is_approved,
                NULL AS status
            FROM
                entries e
            LEFT JOIN
                winner w ON w."entriesId" = e.id
            LEFT JOIN
                voucher v ON w."voucherId" = v.id
            WHERE
                e.is_valid_admin = 1 AND e.is_approved_admin = 1
            UNION ALL
            SELECT
                w.created_at,
                COALESCE(e.coupon, '') AS coupon,
                w.amount,
                'tukar hadiah' AS type,
                w.id,
                COALESCE(v.name, '') AS topup_voucher,
                w."userId",
                w.is_approved,
                w.status
            FROM
                winner w
            LEFT JOIN
                entries e ON e.id = w."entriesId"
            LEFT JOIN
                prize p ON p.id = w."prizeId"
            LEFT JOIN
                voucher v ON v.id = w."voucherId" 
            WHERE
                p."categoryId" = 1
        ) AS cr
        LEFT JOIN users u ON cr."userId" =  u.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY
            cr.created_at, cr.type;
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}

export async function exportConsumerData(params: Filter) {
  const { startDate, endDate } = params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (startDate && endDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(
      `A.rcvd_time BETWEEN $${queryParams.length - 1} AND $${
        queryParams.length
      }`
    );
  } else if (startDate) {
    queryParams.push(
      dayjs(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss")
    );
    whereClauses.push(`A.rcvd_time >= $${queryParams.length}`);
  } else if (endDate) {
    queryParams.push(dayjs(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss"));
    whereClauses.push(`A.rcvd_time <= $${queryParams.length}`);
  }

  const sql = `
        SELECT 
            u.updated_at AS created_at,
            u.hp,
            COALESCE(u.fullname, '-') AS fullname,
            u.identity,
            u.regency_ktp AS city,
            SUM(
                CASE 
                    WHEN e.is_valid = 1
                    THEN 1 ELSE 0 
                END
            ) AS total_submit_valid,
            SUM(
                CASE 
                    WHEN e.is_valid = 0
                THEN 1 ELSE 0 
            END) AS total_submit_invalid,
            COUNT(
                CASE 
                    WHEN e.is_valid IN (0, 1)
                    THEN 1 
                END) AS total_submit,
            u.id
        FROM entries e
        LEFT JOIN users u ON e."userId" = u.id
        WHERE ${whereClauses.join(" AND ")}
        GROUP BY u.updated_at, u.hp, u.fullname, u.regency_ktp, u.id
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}
