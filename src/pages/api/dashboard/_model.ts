import { QueryResult } from "pg";
import { query } from "@/lib/db/postgres";
import { getMedia, getPromo } from "../master/_model";
import dayjs from "dayjs";

export async function getUserRegistered() {
  const activeMedia = await getMedia();
  const selectItem = activeMedia.map(
    (m) =>
      `COUNT(*) FILTER (WHERE "mediaId" = ${
        m.id
      }) AS "${m.name.toLowerCase()}_users"`
  );

  const result: QueryResult = await query(
    // `
    //     WITH today AS (
    //     SELECT COUNT(*) AS total_today
    //     FROM users
    //     WHERE status = 1
    //         AND DATE(created_at) = CURRENT_DATE
    //     ),
    //     yesterday AS (
    //     SELECT COUNT(*) AS total_yesterday
    //     FROM users
    //     WHERE status = 1
    //         AND DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    //     ),
    //     total_users AS (
    //     SELECT
    //         ${selectItem.length ? selectItem.join(",") + "," : ""}
    //         COUNT(*) AS total_users
    //     FROM users
    //     WHERE status = 1
    //     )
    //     SELECT
    //     a.total_users,
    //     CASE
    //         WHEN y.total_yesterday = 0 THEN NULL
    //         ELSE ROUND(((t.total_today - y.total_yesterday)::decimal / y.total_yesterday) * 100, 2)
    //     END AS percentage_change
    //     FROM today t, yesterday y, total_users a;
    //     `
    `WITH today AS (
      SELECT COUNT(*) AS total_today
      FROM users 
         where DATE(created_at) = CURRENT_DATE
      ),
      yesterday AS (
      SELECT COUNT(*) AS total_yesterday
      FROM users
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
      ),
      total_users AS (
      SELECT
      ${selectItem.length ? selectItem.join(",") + "," : ""}
          COUNT(*) AS total_users
      FROM users
      )
      SELECT
      a.total_users,
      CASE
          WHEN y.total_yesterday = 0 THEN NULL
          ELSE ROUND(((t.total_today - y.total_yesterday)::decimal / y.total_yesterday) * 100, 2)
      END AS percentage_change
      FROM today t, yesterday y, total_users a;`
  );

  return result.rows[0] as Record<string, number>;
}

export async function getUserEntries() {
  const activeMedia = await getMedia();
  const selectItemToday = activeMedia.map(
    (m) =>
      `COUNT(*) FILTER (WHERE e."mediaId" =${
        m.id
      }) AS "${m.name.toLowerCase()}_entries_today"`
  );
  const selectItemYesterday = activeMedia.map(
    (m) =>
      `COUNT(*) FILTER (WHERE e."mediaId" =${
        m.id
      }) AS "${m.name.toLowerCase()}_entries_yesterday"`
  );
  const selectItem = activeMedia.map(
    (m) =>
      `COUNT(*) FILTER (WHERE entries."mediaId" =${
        m.id
      }) AS "${m.name.toLowerCase()}_entries"`
  );

  const result: QueryResult = await query(
    `
        WITH today AS (
        SELECT
            ${selectItemToday.length ? selectItemToday.join(",") + "," : ""}
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e.is_valid_admin IS NULL) AS total_unprocessed_entries_today,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e.is_valid_admin = 0 AND e."invalidReasonAdminId" IS NOT NULL) AS total_invalid_entries_by_admin_today,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND (e.is_valid_admin = 1 OR (e.is_valid_admin = 0 AND e."invalidReasonId" = 90))) AS total_valid_entries_by_admin_today,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e."invalidReasonId" = 90 ) AS total_not_luck_today,
            COUNT(*) FILTER (WHERE e.is_valid = 0) AS total_invalid_entries_today,
            COUNT(*) FILTER (WHERE e.is_valid = 1) AS total_valid_entries_today,
            COUNT(DISTINCT e."userId") AS unique_user_entries_today,
            COUNT(*) AS total_entries_today
        FROM entries e
        WHERE DATE(e.created_at) = CURRENT_DATE
        ),
        yesterday AS (
        SELECT
            ${
              selectItemYesterday.length
                ? selectItemYesterday.join(",") + ","
                : ""
            }
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e.is_valid_admin IS NULL) AS total_unprocessed_entries_yesterday,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e.is_valid_admin = 0 AND e."invalidReasonAdminId" IS NOT NULL) AS total_invalid_entries_by_admin_yesterday,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND (e.is_valid_admin = 1 OR (e.is_valid_admin = 0 AND e."invalidReasonId" = 90))) AS total_valid_entries_by_admin_yesterday,
            COUNT(*) FILTER (WHERE e.is_valid = 1 AND e."invalidReasonId" = 90 ) AS total_not_luck_yesterday,
            COUNT(*) FILTER (WHERE e.is_valid = 0) AS total_invalid_entries_yesterday,
            COUNT(*) FILTER (WHERE e.is_valid = 1) AS total_valid_entries_yesterday,
            COUNT(DISTINCT e."userId") AS unique_user_entries_yesterday,
            COUNT(*) AS total_entries_yesterday
        FROM entries e
        WHERE DATE(e.created_at) = CURRENT_DATE - INTERVAL '1 day'
        ),
        totals AS (
        SELECT
            ${selectItem.length ? selectItem.join(",") + "," : ""}
            COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin IS NULL) AS total_unprocessed_entries,
            COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin = 0 AND "invalidReasonAdminId" IS NOT NULL) AS total_invalid_entries_by_admin,
            COUNT(*) FILTER (WHERE is_valid = 1 AND (is_valid_admin = 1 OR (is_valid_admin = 0 AND "invalidReasonId" = 90))) AS total_valid_entries_by_admin,
            COUNT(*) FILTER (WHERE is_valid = 1 AND "invalidReasonId" = 90 ) AS total_not_luck_totals,
            COUNT(*) FILTER (WHERE is_valid = 0) AS total_invalid_entries,
            COUNT(*) FILTER (WHERE is_valid = 1) AS total_valid_entries,
            COUNT(DISTINCT "userId") AS unique_user_entries,
            COUNT(*) AS total_entries
        FROM entries
        )
        SELECT
        -- TOTALS
        t.wa_entries,
        t.total_unprocessed_entries,
        t.total_invalid_entries_by_admin,
        t.total_valid_entries_by_admin,
        t.total_invalid_entries,
        t.total_valid_entries,
        t.unique_user_entries,
        t.total_entries,
        t.total_not_luck_totals,
        -- PERCENTAGES (Today vs Yesterday)
        ROUND(((td.wa_entries_today - yd.wa_entries_yesterday)::DECIMAL / NULLIF(yd.wa_entries_yesterday, 0)) * 100, 2) AS wa_entries_percentage_change,
        ROUND(((td.total_not_luck_today - yd.total_not_luck_yesterday)::DECIMAL / NULLIF(yd.total_not_luck_yesterday, 0)) * 100, 2) AS total_not_lucky_percentage_change,
        ROUND(((td.total_unprocessed_entries_today - yd.total_unprocessed_entries_yesterday)::DECIMAL / NULLIF(yd.total_unprocessed_entries_yesterday, 0)) * 100, 2) AS total_unprocessed_entries_percentage_change,
        ROUND(((td.total_invalid_entries_by_admin_today - yd.total_invalid_entries_by_admin_yesterday)::DECIMAL / NULLIF(yd.total_invalid_entries_by_admin_yesterday, 0)) * 100, 2) AS total_invalid_entries_by_admin_percentage_change,
        ROUND(((td.total_valid_entries_by_admin_today - yd.total_valid_entries_by_admin_yesterday)::DECIMAL / NULLIF(yd.total_valid_entries_by_admin_yesterday, 0)) * 100, 2) AS total_valid_entries_by_admin_percentage_change,
        ROUND(((td.total_invalid_entries_today - yd.total_invalid_entries_yesterday)::DECIMAL / NULLIF(yd.total_invalid_entries_yesterday, 0)) * 100, 2) AS total_invalid_entries_percentage_change,
        ROUND(((td.total_valid_entries_today - yd.total_valid_entries_yesterday)::DECIMAL / NULLIF(yd.total_valid_entries_yesterday, 0)) * 100, 2) AS total_valid_entries_percentage_change,
        ROUND(((td.unique_user_entries_today - yd.unique_user_entries_yesterday)::DECIMAL / NULLIF(yd.unique_user_entries_yesterday, 0)) * 100, 2) AS unique_user_entries_percentage_change,
        ROUND(((td.total_entries_today - yd.total_entries_yesterday)::DECIMAL / NULLIF(yd.total_entries_yesterday, 0)) * 100, 2) AS total_entries_percentage_change
        FROM totals t
        JOIN today td ON true
        JOIN yesterday yd ON true;
        `
  );

  const resultWinner: QueryResult = await query(
    `
       	WITH today AS (
        SELECT
        COUNT(*) FILTER (WHERE e."invalidReasonId" = 90 ) AS total_not_luck_today,
        	  COUNT(*) FILTER (WHERE e.is_approved = 2) AS total_reject_winner_today,
            COUNT(*) FILTER (where e.is_approved = 1) AS total_approve_winner_today,
            COUNT(*) FILTER (WHERE e.is_approved = 0) AS total_unprocessed_winner_today,
            COUNT(DISTINCT e."userId") FILTER (WHERE e.is_approved = 1) AS unique_user_winner_today,
            COUNT(*) AS total_winner_today
        FROM winner e
        WHERE DATE(e.created_at) = CURRENT_DATE 
        ),
        yesterday AS (
        SELECT
        COUNT(*) FILTER (WHERE e."invalidReasonId" = 90 ) AS total_not_luck_yesterday,
            COUNT(*) FILTER (WHERE e.is_approved = 2) AS total_reject_winner_yesterday,
            COUNT(*) FILTER (where e.is_approved = 1) AS total_approve_winner_yesterday,
            COUNT(*) FILTER (WHERE e.is_approved = 0) AS total_unprocessed_winner_yesterday,
            COUNT(DISTINCT e."userId") FILTER (WHERE e.is_approved = 1) AS unique_user_winner_yesterday,
            COUNT(*) AS total_winner_yesterday
        FROM winner e
        WHERE DATE(e.created_at) = CURRENT_DATE - INTERVAL '1 day' 
        ),
        totals AS (
        SELECT
        	COUNT(*) FILTER (WHERE e."invalidReasonId" = 90 ) AS total_not_luck_totals,
            COUNT(*) FILTER (WHERE e.is_approved = 2) AS total_reject_winner_totals,
            COUNT(*) FILTER (where e.is_approved = 1) AS total_approve_winner_totals,
            COUNT(*) FILTER (WHERE e.is_approved = 0) AS total_unprocessed_winner_totals,
            COUNT(DISTINCT e."userId") FILTER (WHERE e.is_approved = 1) AS unique_user_winner_totals,
            COUNT(*) AS total
        FROM winner e 
        ),
        yesterdayTotalsEnt AS (
        SELECT
        	COUNT(*) FILTER (WHERE a."invalidReasonId" = 90 ) AS yesterday_entries_not_luck_totals,
            COUNT(*) AS total
        FROM entries a
        WHERE DATE(a.created_at) = CURRENT_DATE - INTERVAL '1 day' 
        ),
        totalsEnt AS (
        SELECT
        	COUNT(*) FILTER (WHERE a."invalidReasonId" = 90 ) AS entries_not_luck_totals,
            COUNT(*) AS total
        FROM entries a
        )
        SELECT
        -- TOTALS
        td.total_reject_winner_today,
        td.total_approve_winner_today,
        td.total_unprocessed_winner_today,
        td.unique_user_winner_today,
        td.total_winner_today,
        td.total_not_luck_today,
        yd.total_reject_winner_yesterday,
        yd.total_approve_winner_yesterday,
        yd.total_unprocessed_winner_yesterday,
        yd.unique_user_winner_yesterday,
        yd.total_winner_yesterday,
        yd.total_not_luck_yesterday,
        yte.yesterday_entries_not_luck_totals,
        yte.total,
        e.entries_not_luck_totals,
        t.total_not_luck_totals,
        t.total_reject_winner_totals,
        t.total_approve_winner_totals,
        t.total_unprocessed_winner_totals,
        t.unique_user_winner_totals,
        t.total,
        ROUND(((yte.total - yte.yesterday_entries_not_luck_totals)::DECIMAL / NULLIF(e.total, 0)) * 100, 2) AS entries_not_lucky_percentage_change,
        -- ROUND(((td.total_not_luck_today - yd.total_not_luck_yesterday)::DECIMAL / NULLIF(yd.total_not_luck_yesterday, 0)) * 100, 2) AS total_not_lucky_percentage_change,
        CASE
	        WHEN yd.total_not_luck_yesterday = 0 
	             AND td.total_not_luck_today = 0 THEN 0
	        WHEN yd.total_not_luck_yesterday = 0 THEN 100
        ELSE ROUND(
            ((td.total_not_luck_today - yd.total_not_luck_yesterday)::DECIMAL 
             / yd.total_not_luck_yesterday) * 100,
            2
        )
    	  END AS total_not_lucky_percentage_change,
        ROUND(((td.total_winner_today - yd.total_winner_yesterday)::DECIMAL / NULLIF(yd.total_winner_yesterday, 0)) * 100, 2) AS total_winner_percentage_change,
        ROUND(((td.total_reject_winner_today - yd.total_reject_winner_yesterday)::DECIMAL / NULLIF(yd.total_reject_winner_yesterday, 0)) * 100, 2) AS winner_reject_percentage_change,
        ROUND((( td.total_approve_winner_today - yd.total_approve_winner_yesterday)::DECIMAL / NULLIF(yd.total_approve_winner_yesterday, 0)) * 100, 2) AS total_valid_winner_percentage_change,
        ROUND((( td.total_unprocessed_winner_today - yd.total_unprocessed_winner_yesterday)::DECIMAL / NULLIF(yd.total_unprocessed_winner_yesterday, 0)) * 100, 2) AS total_unprocessed_winner_percentage_change
        FROM totals t
        JOIN today td ON true
        JOIN yesterday yd ON true
        join totalsEnt e on true
       	join yesterdayTotalsEnt yte on true;
        `
  );

  const data = [
    result.rows[0] as Record<string, number>,
    resultWinner.rows[0] as Record<string, number>,
  ];

  return data;
}

export async function getUserDemographic() {
  const result: QueryResult = await query(`
        SELECT *
        FROM (
            SELECT
                COALESCE(NULLIF(gender, ''), 'unregistered') AS gender,
                CASE
                    WHEN age = 0 THEN 'Unregistered'
                    WHEN age < 17 THEN '< 17 Thn'
                    WHEN age BETWEEN 17 AND 25 THEN '17-25 Thn'
                    WHEN age BETWEEN 26 AND 35 THEN '26-35 Thn'
                    WHEN age BETWEEN 36 AND 45 THEN '36-45 Thn'
                    WHEN age BETWEEN 46 AND 55 THEN '46-55 Thn'
                    ELSE '56 Thn >'
                END AS age_group,
                COUNT(*) AS total,
                MIN(age) AS min_age
            FROM users
            WHERE status = 1
            GROUP BY
                COALESCE(NULLIF(gender, ''), 'unregistered'),
                CASE
                    WHEN age = 0 THEN 'Unregistered'
                    WHEN age < 17 THEN '< 17 Thn'
                    WHEN age BETWEEN 17 AND 25 THEN '17-25 Thn'
                    WHEN age BETWEEN 26 AND 35 THEN '26-35 Thn'
                    WHEN age BETWEEN 36 AND 45 THEN '36-45 Thn'
                    WHEN age BETWEEN 46 AND 55 THEN '46-55 Thn'
                    ELSE '56 Thn >'
                END
        ) AS grouped
        ORDER BY
            CASE 
                WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'F' THEN 1
                WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'M' THEN 2
                WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'unregistered' THEN 3
                ELSE 4
            END,
            CASE
                WHEN min_age = 0 THEN 0
                WHEN min_age < 17 THEN 1
                WHEN min_age BETWEEN 17 AND 25 THEN 2
                WHEN min_age BETWEEN 26 AND 35 THEN 3
                WHEN min_age BETWEEN 36 AND 45 THEN 4
                WHEN min_age BETWEEN 46 AND 55 THEN 5
                ELSE 6
            END;
    `);
  const gender: Record<string, number> = {};
  const age_group: Record<string, number> = {};
  for (const row of result.rows) {
    const genderKey = row.gender;
    if (genderKey) {
      gender[genderKey] = (+gender[genderKey] || 0) + +row.total;
    }
    if (row.age_group) {
      age_group[row.age_group] = (+age_group[row.age_group] || 0) + +row.total;
    }
  }
  const genderSeries = Object.values(gender);
  const genderCategories = Object.keys(gender).map((g) => {
    if (g === "F") return "Perempuan";
    if (g === "M") return "Laki-Laki";
    if (g === "unregistered") return "Unregistered";
    return g;
  });
  const ageGroupSeries = Object.values(age_group);
  const ageGroupCategories = Object.keys(age_group);
  return {
    gender: { categories: genderCategories, series: genderSeries },
    age_group: { categories: ageGroupCategories, series: ageGroupSeries },
  };
}

export async function getUserStatistic({
  type,
  include_out_period,
}: {
  type: "daily" | "weekly" | "monthly";
  include_out_period: boolean;
}) {
  const period = await getPromo();
  if (!period) throw new Error("Promo period not found");

  let dateTruncUnit: string;
  let step: string;
  switch (type) {
    case "weekly":
      dateTruncUnit = "week";
      step = "1 week";
      break;
    case "monthly":
      dateTruncUnit = "month";
      step = "1 month";
      break;
    case "daily":
    default:
      dateTruncUnit = "day";
      step = "1 day";
      break;
  }

  const promoStart = dayjs(period.periode_start).format("YYYY-MM-DD HH:mm:ss");
  const promoEnd = dayjs().isBefore(period.periode_end)
    ? dayjs().format("YYYY-MM-DD HH:mm:ss")
    : dayjs(period.periode_end).format("YYYY-MM-DD HH:mm:ss");
  const params = [promoStart, promoEnd];

  const sql = `
        WITH raw_range AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', MIN(created_at)) AS min_date,
                DATE_TRUNC('${dateTruncUnit}', MAX(created_at)) AS max_date
            FROM users
        ),
        data_range AS (
            SELECT
                COALESCE(
                    CASE WHEN ${include_out_period ? "TRUE" : "FALSE"}
                        THEN (SELECT min_date FROM raw_range)
                        ELSE $1::timestamp
                    END,
                    $1::timestamp
                ) AS start_date,
                $2::timestamp AS end_date
        ),
        date_series AS (
            SELECT generate_series(
                (SELECT start_date FROM data_range),
                (SELECT end_date FROM data_range),
                INTERVAL '${step}'
            ) AS period
        ),
        user_counts AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', created_at) AS period,
                COUNT(*) AS total_users
            FROM users
            WHERE created_at BETWEEN (SELECT start_date FROM data_range)
              AND (SELECT end_date FROM data_range)
              AND status = 1
            GROUP BY period
        )
        SELECT
            ds.period,
            COALESCE(uc.total_users, 0) AS total_users
        FROM date_series ds
        LEFT JOIN user_counts uc ON ds.period = uc.period
        ORDER BY ds.period ASC;
    `;

  const result: QueryResult = await query(sql, params);

  const categories: string[] = [];
  const total_users: number[] = [];

  for (const row of result.rows) {
    const period = dayjs(row.period);
    let label: string;

    if (type === "weekly") {
      const start = period.startOf("week");
      const end = period.endOf("week");
      label = `${start.locale("id").format("DD MMM YYYY")} - ${end
        .locale("id")
        .format("DD MMM YYYY")}`;
    } else if (type === "monthly") {
      label = period.locale("id").format("MMMM YYYY");
    } else {
      label = period.locale("id").format("DD MMM YYYY");
    }

    categories.push(label);
    total_users.push(Number(row.total_users));
  }

  return {
    categories,
    series: [{ name: "Total Users", data: total_users }],
  };
}

export async function getEntryStatistic({
  type,
  include_out_period,
}: {
  type: "daily" | "weekly" | "monthly";
  include_out_period: boolean;
}) {
  const period = await getPromo();
  if (!period) throw new Error("Promo period not found");

  const params: string[] = [];

  let dateTruncUnit: string;
  let step: string;
  switch (type) {
    case "weekly":
      dateTruncUnit = "week";
      step = "1 week";
      break;
    case "monthly":
      dateTruncUnit = "month";
      step = "1 month";
      break;
    case "daily":
    default:
      dateTruncUnit = "day";
      step = "1 day";
      break;
  }

  const promoStart = dayjs(period.periode_start).format("YYYY-MM-DD HH:mm:ss");
  const promoEnd = dayjs().isBefore(period.periode_end)
    ? dayjs().format("YYYY-MM-DD HH:mm:ss")
    : dayjs(period.periode_end).format("YYYY-MM-DD HH:mm:ss");
  params.push(promoStart, promoEnd);

  const sql = `
        WITH raw_range AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', MIN(rcvd_time)) AS min_date,
                DATE_TRUNC('${dateTruncUnit}', MAX(rcvd_time)) AS max_date
            FROM entries
        ),
        data_range AS (
            SELECT
                COALESCE(
                    CASE WHEN ${include_out_period ? "TRUE" : "FALSE"}
                        THEN (SELECT min_date FROM raw_range)
                        ELSE $1::timestamp
                    END,
                    $1::timestamp
                ) AS start_date,
                $2::timestamp AS end_date
        ),
        date_series AS (
            SELECT generate_series(
                (SELECT start_date FROM data_range),
                (SELECT end_date FROM data_range),
                INTERVAL '${step}'
            ) AS period
        ),
        entry_counts AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', rcvd_time) AS period,
                COUNT(*) AS total_entries
            FROM entries
              WHERE rcvd_time BETWEEN (SELECT start_date FROM data_range)
              AND (SELECT end_date FROM data_range)
            GROUP BY period
        )
        SELECT
            ds.period,
            COALESCE(ec.total_entries, 0) AS total_entries
        FROM date_series ds
        LEFT JOIN entry_counts ec ON ds.period = ec.period
        ORDER BY ds.period ASC;
    `;

  const result: QueryResult = await query(sql, params);

  const categories: string[] = [];
  const total_entries: number[] = [];

  for (const row of result.rows) {
    const period = dayjs(row.period);
    let label: string;

    if (type === "weekly") {
      const start = period.startOf("week");
      const end = period.endOf("week");
      label = `${start.locale("id").format("DD MMM YYYY")} - ${end
        .locale("id")
        .format("DD MMM YYYY")}`;
    } else if (type === "monthly") {
      label = period.locale("id").format("MMMM YYYY");
    } else {
      label = period.locale("id").format("DD MMM YYYY");
    }

    categories.push(label);
    total_entries.push(Number(row.total_entries));
  }

  return {
    categories,
    series: [{ name: "Total Entries", data: total_entries }],
  };
}
