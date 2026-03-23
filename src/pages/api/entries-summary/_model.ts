import { QueryResult } from "pg";
import { query } from "@/lib/db/postgres";
import { getInvalidReason, getPromo } from "../master/_model";
import dayjs from "dayjs";
import "dayjs/locale/id";

export async function getEntryStatistic({
  type,
  include_out_period,
}: {
  type: "daily" | "weekly" | "monthly";
  include_out_period: boolean;
}) {
  const period = await getPromo();
  if (!period) throw new Error("Promo period not found");

  const dateTruncUnit =
    type === "weekly" ? "week" : type === "monthly" ? "month" : "day";
  const step =
    type === "weekly" ? "1 week" : type === "monthly" ? "1 month" : "1 day";

  const promoStart = dayjs(period.periode_start).format("YYYY-MM-DD HH:mm:ss");
  const promoEnd = dayjs().isBefore(period.periode_end)
    ? dayjs().format("YYYY-MM-DD HH:mm:ss")
    : dayjs(period.periode_end).format("YYYY-MM-DD HH:mm:ss");

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
                COUNT(*) AS total_entries,
                COUNT(*) FILTER (WHERE is_valid = 1 AND status = 1) AS valid_entries,
                -- COUNT(*) FILTER (WHERE is_valid = 1 AND status = 1 and "invalidReasonId" is not NULL) AS valid_entries_not_lucky,
                COUNT(*) FILTER (WHERE is_valid = 1 AND status IN(2, 3)) AS process_entries,
                COUNT(*) FILTER (WHERE is_valid = 0) AS invalid_entries,
                COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin = 0 AND "invalidReasonAdminId" is NOT NULL) AS "invalid_entries_admin",
                COUNT(*) FILTER (WHERE is_valid = 1 AND (is_valid_admin = 1 OR (is_valid_admin = 0 AND "invalidReasonId" = 90))) AS "valid_entries_admin",
                COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin is NULL) AS "unprocessed_admin_entries"
            FROM entries
            GROUP BY period
        )
        SELECT
            ds.period,
            COALESCE(ec.total_entries, 0) AS total_entries,
            COALESCE(ec.valid_entries, 0) AS valid_entries,
            -- COALESCE(es.valid_entries_not_lucky, 0) AS valid_entries_not_lucky,
            COALESCE(ec.process_entries, 0) AS process_entries,
            COALESCE(ec.invalid_entries, 0) AS invalid_entries,
            COALESCE(ec.invalid_entries_admin, 0) AS invalid_entries_admin,
            COALESCE(ec.valid_entries_admin, 0) AS valid_entries_admin,
            COALESCE(ec.unprocessed_admin_entries, 0) AS unprocessed_admin_entries
        FROM date_series ds
        LEFT JOIN entry_counts ec ON ds.period = ec.period
        ORDER BY ds.period ASC;
    `;

  const params = [promoStart, promoEnd];
  const result: QueryResult = await query(sql, params);

  const categories: string[] = [];
  const total_entries: number[] = [];
  const valid_entries: number[] = [];
  const process_entries: number[] = [];
  const invalid_entries: number[] = [];
  const invalid_entries_admin: number[] = [];
  const valid_entries_admin: number[] = [];
  // const unprocessed_admin_entries: number[] = [];

  const listData: Array<{
    date: string;
    validEntries: number;
    processEntries: number;
    invalidEntries: number;
    approveEntries: number;
    rejectEntries: number;
    // unproceessedAdminEntries: number;
    totalEntries: number;
  }> = [];

  for (const row of result.rows) {
    const period = dayjs(row.period);
    let label: string;
    let dateValue: string;

    if (type === "weekly") {
      const start = period.startOf("week");
      const end = period.endOf("week");
      label = `${start.locale("id").format("DD MMM YYYY")} - ${end
        .locale("id")
        .format("DD MMM YYYY")}`;
      dateValue = label;
    } else if (type === "monthly") {
      label = period.locale("id").format("MMMM YYYY");
      dateValue = dayjs(row.period).format("YYYY-MM");
    } else {
      label = period.locale("id").format("DD MMM YYYY");
      dateValue = dayjs(row.period).format("YYYY-MM-DD");
    }

    const totalEntriesCount = Number(row.total_entries);
    const validEntriesCount = Number(row.valid_entries);
    const processEntriesCount = Number(row.process_entries);
    const invalidEntriesCount = Number(row.invalid_entries);
    const invalidEntriesAdminCount = Number(row.invalid_entries_admin);
    const validEntriesAdminCount = Number(row.valid_entries_admin);
    // const unproccessedAdminEntriesCount = Number(row.unprocessed_admin_entries);

    categories.push(label);
    total_entries.push(totalEntriesCount);
    valid_entries.push(validEntriesCount);
    process_entries.push(processEntriesCount);
    invalid_entries.push(invalidEntriesCount);
    invalid_entries_admin.push(invalidEntriesAdminCount);
    valid_entries_admin.push(validEntriesAdminCount);
    // unprocessed_admin_entries.push(unproccessedAdminEntriesCount);

    listData.push({
      date: dateValue,
      validEntries: validEntriesCount,
      processEntries: processEntriesCount,
      invalidEntries: invalidEntriesCount,
      approveEntries: validEntriesAdminCount,
      rejectEntries: invalidEntriesAdminCount,
      // unproceessedAdminEntries: unproccessedAdminEntriesCount,
      totalEntries: totalEntriesCount,
    });
  }

  const totalValidEntries = valid_entries.reduce((a, b) => a + b, 0);
  const totalProcessEntries = process_entries.reduce((a, b) => a + b, 0);
  const totalInvalidEntries = invalid_entries.reduce((a, b) => a + b, 0);
  const totalTotalEntries = total_entries.reduce((a, b) => a + b, 0);
  const totalInvalidEntriesAdmin = invalid_entries_admin.reduce(
    (a, b) => a + b,
    0
  );
  const totalValidEntriesAdmin = valid_entries_admin.reduce((a, b) => a + b, 0);
  // const totalUnprocessedAdminEntries = unprocessed_admin_entries.reduce(
  //   (a, b) => a + b,
  //   0
  // );

  listData.push({
    date: "Total",
    validEntries: totalValidEntries,
    processEntries: totalProcessEntries,
    invalidEntries: totalInvalidEntries,
    approveEntries: totalValidEntriesAdmin,
    rejectEntries: totalInvalidEntriesAdmin,
    // unproceessedAdminEntries: totalUnprocessedAdminEntries,
    totalEntries: totalTotalEntries,
  });

  return {
    categories,
    series: [
      { name: "Total Entries", data: total_entries },
      { name: "Valid Entries", data: valid_entries },
      { name: "Process Entries", data: process_entries },
      { name: "Invalid Entries", data: invalid_entries },
      { name: "Approved Entries", data: valid_entries_admin },
      { name: "Reject Entries", data: invalid_entries_admin },
      // { name: "Unprocessed Admin Entries", data: unprocessed_admin_entries },
    ],
    list: listData,
  };
}

export async function getEntrySummary({
  type,
  include_out_period,
}: {
  type: "daily" | "weekly" | "monthly";
  include_out_period: boolean;
}) {
  const period = await getPromo();
  if (!period) throw new Error("Promo period not found");

  const invalidReasonList = await getInvalidReason();
  const invalidReasonMap = new Map<number, string>();
  invalidReasonList.forEach((r) => invalidReasonMap.set(r.id, r.name));

  const dateTruncUnit =
    type === "weekly" ? "week" : type === "monthly" ? "month" : "day";
  const step =
    type === "weekly" ? "1 week" : type === "monthly" ? "1 month" : "1 day";

  const promoStart = dayjs(period.periode_start).format("YYYY-MM-DD HH:mm:ss");
  const promoEnd = dayjs().isBefore(period.periode_end)
    ? dayjs().format("YYYY-MM-DD HH:mm:ss")
    : dayjs(period.periode_end).format("YYYY-MM-DD HH:mm:ss");

  const reasonColumns = invalidReasonList
    .map(
      (r) =>
        `SUM(CASE WHEN (COALESCE(e."invalidReasonId", e."invalidReasonAdminId") = ${r.id}) THEN 1 ELSE 0 END) AS "reason_${r.id}"`
    )
    .join(", ");

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
        entry_summary AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', e.rcvd_time) AS period,
                COUNT(*) FILTER (WHERE is_valid = 1 AND status = 1) AS valid_entries,
                -- COUNT(*) FILTER (WHERE is_valid = 1 AND status = 1 and "invalidReasonId" is not NULL) AS not_lucky,
                COUNT(*) FILTER (WHERE is_valid = 1 AND status IN(2, 3)) AS process_entries,
                COUNT(*) FILTER (WHERE is_valid = 0 AND status = 1) AS invalid_entries,
                COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin = 0 AND "invalidReasonAdminId" is NOT NULL) AS "invalid_entries_admin",
                COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin = 1) AS "valid_entries_admin",
                -- COUNT(*) FILTER (WHERE is_valid = 1 AND is_valid_admin is null) AS unprocessed_admin_entries,
                COUNT(*) FILTER (
                    WHERE e.is_valid = 0 AND (e."invalidReasonId" IS NOT NULL OR e."invalidReasonAdminId" IS NOT NULL)
                ) AS invalid_with_reason
                ${reasonColumns ? "," + reasonColumns : ""}
            FROM entries e
            WHERE e.rcvd_time BETWEEN (SELECT start_date FROM data_range) AND (SELECT end_date FROM data_range)
            GROUP BY period
        )
        SELECT
            ds.period,
            COALESCE(es.valid_entries, 0) AS valid_entries,
            -- COALESCE(es.not_lucky, 0) AS "notLucky",
            COALESCE(es.process_entries, 0) AS process_entries,
            COALESCE(es.invalid_entries, 0) AS invalid_entries,
            COALESCE(es.invalid_entries_admin) AS invalid_entries_admin,
            COALESCE(es.valid_entries_admin) AS valid_entries_admin,
            -- COALESCE(es.unprocessed_admin_entries, 0) AS unprocessed_admin_entries,
            COALESCE(es.invalid_with_reason, 0) AS invalid_with_reason
            ${
              invalidReasonList.length > 0
                ? "," +
                  invalidReasonList
                    .map(
                      (r) =>
                        `COALESCE(es."reason_${r.id}", 0) AS "period_reason_${r.id}"`
                    )
                    .join(", ")
                : ""
            }
        FROM date_series ds
        LEFT JOIN entry_summary es ON ds.period = es.period
        ORDER BY ds.period DESC;
    `;

  const params = [promoStart, promoEnd];
  const result: QueryResult = await query(sql, params);

  const categories: string[] = [];
  const validEntries: number[] = [];
  const processEntries: number[] = [];
  const invalidEntries: number[] = [];
  const unprocessedEntries: number[] = [];
  const invalidEntriesAdmin: number[] = [];
  const validEntriesAdmin: number[] = [];
  const reasonTotals = new Map<number, number>();
  const listData: Record<string, unknown>[] = [];

  for (const row of result.rows) {
    const period = dayjs(row.period);
    let label: string;
    let dateValue: string;

    if (type === "weekly") {
      const start = period.startOf("week");
      const end = period.endOf("week");
      label = `${start.locale("id").format("DD MMM YYYY")} - ${end
        .locale("id")
        .format("DD MMM YYYY")}`;
      dateValue = label;
    } else if (type === "monthly") {
      label = period.locale("id").format("MMMM YYYY");
      dateValue = period.format("YYYY-MM");
    } else {
      label = period.locale("id").format("DD MMM YYYY");
      dateValue = period.format("YYYY-MM-DD");
    }

    const validCount = Number(row.valid_entries || 0);
    const processCount = Number(row.process_entries || 0);
    const invalidCount = Number(row.invalid_entries || 0);
    const unprocessedCount = Number(row.unprocessed_admin_entries || 0);
    const invalidEntriesAdminCount = Number(row.invalid_entries_admin || 0);
    const validEntriesAdminCount = Number(row.valid_entries_admin || 0);

    validEntries.push(validCount);
    processEntries.push(processCount);
    invalidEntries.push(invalidCount);
    unprocessedEntries.push(unprocessedCount);
    invalidEntriesAdmin.push(invalidEntriesAdminCount);
    validEntriesAdmin.push(validEntriesAdminCount);
    categories.push(label);

    const base: Record<string, string | number> = {
      date: dateValue,
      valid: validCount,
      process: processCount,
      invalid: invalidCount,
      unprocessedAdmin: unprocessedCount,
      approvedBeruntung: validEntriesAdminCount,
      rejected: invalidEntriesAdminCount,
    };

    invalidReasonList.forEach((r) => {
      const col = `period_reason_${r.id}`;
      const count = Number(row[col] || 0);
      base[invalidReasonMap.get(r.id) || `Reason ${r.id}`] = count;
      reasonTotals.set(r.id, (reasonTotals.get(r.id) || 0) + count);
    });

    listData.push(base);
  }

  const totalValid = validEntries.reduce((a, b) => a + b, 0);
  const totalProcess = processEntries.reduce((a, b) => a + b, 0);
  const totalInvalid = invalidEntries.reduce((a, b) => a + b, 0);
  const totalUnprocessed = unprocessedEntries.reduce((a, b) => a + b, 0);
  const totalInvalidAdmin = invalidEntriesAdmin.reduce((a, b) => a + b, 0);
  const totalValidAdmin = validEntriesAdmin.reduce((a, b) => a + b, 0);

  const totalRow: Record<string, string | number> = {
    date: "Total",
    valid: totalValid,
    process: totalProcess,
    invalid: totalInvalid,
    unprocessedAdmin: totalUnprocessed,
    approvedBeruntung: totalValidAdmin,
    rejected: totalInvalidAdmin,
  };

  invalidReasonList.forEach((r) => {
    const name = invalidReasonMap.get(r.id) || `Reason ${r.id}`;
    totalRow[name] = reasonTotals.get(r.id) || 0;
  });

  listData.push(totalRow);

  const entryStatusChart = {
    categories: ["Valid Entries", "Process Entries", "Invalid Entries"],
    series: [totalValid, totalProcess, totalInvalid],
  };

  const sortedReasons = Array.from(reasonTotals.entries()).sort(
    ([, a], [, b]) => b - a
  );
  const invalidReasonChart = {
    categories: sortedReasons.map(
      ([id]) => invalidReasonMap.get(id) || `Reason ${id}`
    ),
    series: sortedReasons.map(([, count]) => count),
  };

  return {
    entryStatusChart,
    invalidReasonChart,
    list: listData,
  };
}
