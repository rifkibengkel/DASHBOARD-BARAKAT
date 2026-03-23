import { QueryResult } from "pg";
import { query } from "@/lib/db/postgres";

export async function getGenderDemographic() {
  const result: QueryResult = await query(`
    SELECT
    COALESCE(NULLIF(gender, ''), 'unregistered') AS gender,
    COUNT(*) AS total
    FROM users
    GROUP BY COALESCE(NULLIF(gender, ''), 'unregistered')
    ORDER BY 
    CASE 
        WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'F' THEN 1
        WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'M' THEN 2
        WHEN COALESCE(NULLIF(gender, ''), 'unregistered') = 'unregistered' THEN 3
        ELSE 4
    END;
    `);

  const gender: Record<string, number> = {};

  for (const row of result.rows) {
    const genderKey = row.gender;
    gender[genderKey] = +row.total;
  }

  const genderSeries = Object.values(gender);
  const genderCategories = Object.keys(gender).map((g) => {
    if (g === "F") return "Perempuan";
    if (g === "M") return "Laki-Laki";
    if (g === "unregistered") return "Unregistered";
    return g;
  });

  return {
    categories: genderCategories,
    series: genderSeries,
  };
}

export async function getStoreDemographicByDateWithUsers() {
  const result = await query(
    `
       SELECT
  COALESCE(s."name", 'Unknown') AS store,
  COUNT(DISTINCT e."userId") AS unique_users,
  SUM(CASE WHEN e.is_valid = 1 THEN 1 ELSE 0 END) AS valid_count,
  SUM(CASE WHEN e.is_valid = 0 THEN 1 ELSE 0 END) AS invalid_count,
COUNT(*) AS total
FROM entries e
LEFT JOIN users u ON e."userId" = u.id
LEFT JOIN store s ON e."storeId" = s.id
GROUP BY COALESCE(s."name", 'Unknown')
ORDER BY store ASC;
    `
    //     `
    //              SELECT
    // --        t.tanggal,
    //         t.store,
    //         t.city,
    //         cu.unique_users,
    //         SUM(t.valid_count)   AS valid_count,
    //         SUM(t.invalid_count) AS invalid_count,
    //         SUM(t.total_entries) AS total
    //       FROM (
    //         SELECT
    // --          TO_CHAR(
    // --  		e.created_at AT TIME ZONE 'Asia/Jakarta',
    // --  		'YYYY-MM-DD'
    // --		) AS tanggal,
    //           COALESCE(s."name", 'Unknown') AS store,
    //           COALESCE(u.regency_ktp, 'Unknown') AS city,
    //           CASE WHEN e.is_valid = 1 THEN 1 ELSE 0 END AS valid_count,
    //           CASE WHEN e.is_valid = 0 THEN 1 ELSE 0 END AS invalid_count,
    //           1 AS total_entries
    //         FROM entries e
    //         LEFT JOIN users u ON e."userId" = u.id
    //         LEFT JOIN store s ON e."storeId" = s.id
    //       ) t
    //       JOIN (
    //         SELECT
    //           COALESCE(u.regency_ktp, 'Unknown') AS city,
    //           COUNT(DISTINCT e."userId") AS unique_users
    //         FROM entries e
    //         LEFT JOIN users u ON e."userId" = u.id
    //         GROUP BY u.regency_ktp
    //       ) cu ON cu.city = t.city
    //       GROUP BY
    // --        t.tanggal,
    //         t.store,
    //         t.city,
    //         cu.unique_users ORDER BY t.store asc;
    //     `
  );

  const normalizeKey = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  /* =========================
         DATA UNTUK TABLE
      ========================== */
  const table = result.rows.map((row, index) => ({
    id: index + 1,
    tanggal: row.tanggal, // 2026-01-27
    store: row.store, // Alfamart
    storeKey: normalizeKey(row.store),
    city: row.city ? row.city : "Unknown",
    uniqueusers: Number(row.unique_users),
    valid: Number(row.valid_count),
    invalid: Number(row.invalid_count),
    total: Number(row.total),
  }));

  /* =========================
         DATA UNTUK CHART
         (group per tanggal)
      ========================== */
  const chartByDate: Record<string, Record<string, number>> = {};

  for (const row of result.rows) {
    console.log(row, "ROOWW");

    // const tanggal = row.tanggal;
    const storeKey = normalizeKey(row.store);
    const total = Number(row.total);

    if (!chartByDate[total]) {
      chartByDate[total] = {};
    }

    chartByDate[total][storeKey] = total;
  }

  return {
    table, // ✅ MUI DataGrid
    chartByDate, // ✅ Chart per tanggal
  };
}

export async function getStoreDemographic() {
  const result: QueryResult = await query(`
         SELECT
    COALESCE(b."name", 'Unknown') AS store,
    COUNT(a.id) AS total
    FROM entries a
    LEFT JOIN store b ON a."storeId" = b.id
    GROUP BY b."name" 
    `);

  const table: QueryResult = await query(`
    SELECT
    DATE(a.created_at) AS tanggal,
    COALESCE(b."name", 'Unknown') AS store,
    COUNT(a.id) AS total
    FROM entries a
    LEFT JOIN store b ON a."storeId" = b.id
    GROUP BY DATE(a.created_at), b."name"
    ORDER BY tanggal;
    `);
  const name: string[] = [];
  const countPerStore: number[] = [];

  const normalizeKey = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, "");

  const list = table.rows.reduce<Record<string, number>>((acc, row) => {
    const key = normalizeKey(row.store);
    const total = Number(row.total);

    acc[key] = total;
    return acc;
  }, {});

  for (const row of result.rows) {
    const count = Number(row.total);
    name.push(row.store);
    countPerStore.push(count);
  }

  return {
    categories: name,
    series: countPerStore,
    list: list,
  };
}

export async function getAgeDemographic() {
  const result: QueryResult = await query(`
       WITH age_groups AS (
            SELECT
                CASE
                    WHEN age = 0 THEN 'Unregistered'
                    WHEN age < 17 THEN '< 17 Thn'
                    WHEN age BETWEEN 17 AND 25 THEN '17-25 Thn'
                    WHEN age BETWEEN 26 AND 35 THEN '26-35 Thn'
                    WHEN age BETWEEN 36 AND 45 THEN '36-45 Thn'
                    WHEN age BETWEEN 46 AND 55 THEN '46-55 Thn'
                    ELSE '56 Thn >'
                END AS age_group,
                CASE
                    WHEN age = 0 THEN 0
                    WHEN age < 17 THEN 1
                    WHEN age BETWEEN 17 AND 25 THEN 2
                    WHEN age BETWEEN 26 AND 35 THEN 3
                    WHEN age BETWEEN 36 AND 45 THEN 4
                    WHEN age BETWEEN 46 AND 55 THEN 5
                    ELSE 6
                END AS order_key
            FROM users
        )
        SELECT 
            age_group,
            COUNT(*) AS total
        FROM age_groups
        GROUP BY age_group, order_key
        ORDER BY order_key;

    `);

  const age_group: Record<string, number> = {};

  for (const row of result.rows) {
    if (row.age_group) {
      age_group[row.age_group] = +row.total;
    }
  }

  const ageGroupSeries = Object.values(age_group);
  const ageGroupCategories = Object.keys(age_group);

  return {
    categories: ageGroupCategories,
    series: ageGroupSeries,
  };
}

export async function getDistribution() {
  const result: QueryResult = await query(`
       SELECT 
            COALESCE(u.regency_ktp, 'Unknown') AS city,
            COUNT(DISTINCT e."userId") AS unique_users,
            SUM(CASE WHEN e.is_valid = 1 THEN 1 ELSE 0 END) AS valid_count,
            SUM(CASE WHEN e.is_valid = 0 THEN 1 ELSE 0 END) AS invalid_count,
            COUNT(e.id) AS total_entries
        FROM entries e
        LEFT JOIN users u ON e."userId" = u.id
        GROUP BY u.regency_ktp
        HAVING COUNT(e.id) > 0
        ORDER BY total_entries DESC,u.regency_ktp ASC
    `);

  const cities: string[] = [];
  const entriesPerCity: number[] = [];
  const cityDetails: Array<{
    city: string;
    valid: number;
    invalid: number;
    total: number;
    uniqueUsers: number;
  }> = [];

  let totalValid = 0;
  let totalInvalid = 0;

  for (const row of result.rows) {
    const valid = Number(row.valid_count);
    const invalid = Number(row.invalid_count);
    const total = Number(row.total_entries);
    const uniqueUsers = Number(row.unique_users);

    totalValid += valid;
    totalInvalid += invalid;

    cities.push(row.city ? row.city : "UNREGISTERED");
    entriesPerCity.push(total);

    cityDetails.push({
      city: row.city ? row.city : "UNREGISTERED",
      valid,
      invalid,
      total,
      uniqueUsers,
    });
  }

  return {
    overall: {
      categories: ["Valid", "Invalid"],
      series: [totalValid, totalInvalid],
    },

    perCity: {
      categories: cities,
      series: entriesPerCity,
    },

    list: cityDetails,
  };
}
