import { query, withTransaction } from "@/lib/db/postgres";
import {
  Entries,
  EntriesDetail,
  EntriesDetailImage,
  EntriesDetailVariant,
  Filter,
  Pagination,
} from "@/types";
import dayjs from "dayjs";

interface SaveEntries {
  userId: number;
  entries: EntriesDetail;
  // entriesVariant: EntriesDetailVariant[];
}

export async function getEntriesList(params: Filter & Pagination) {
  const {
    mediaId,
    key,
    startDate,
    endDate,
    isValid,
    isValidAdmin,
    isApprovedAdmin,
    prizeCategoryId,
    column,
    direction,
    page,
    limit,
  } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const queryParams: (string | number)[] = [];
  const whereClauses: string[] = ["1=1"];

  if (mediaId !== undefined && mediaId !== null && String(mediaId) !== "") {
    queryParams.push(mediaId);
    whereClauses.push(`A."mediaId" = $${queryParams.length}`);
  }

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(B.fullname ILIKE $${queryParams.length} OR A.coupon ILIKE $${queryParams.length} OR A.sender ILIKE $${queryParams.length} OR B.identity ILIKE $${queryParams.length} OR P.name ILIKE $${queryParams.length})`
    );
  }

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

  if (isValid !== undefined && isValid !== null) {
    queryParams.push(isValid);
    whereClauses.push(`A.is_valid = $${queryParams.length}`);
  }

  if (isValidAdmin !== undefined && isValidAdmin !== null) {
    switch (isValidAdmin) {
      case 0:
        whereClauses.push(`A.is_valid_admin IS NULL`);
        break;
      case 1:
        queryParams.push(1);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      case 2:
        queryParams.push(0);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      default:
        break;
    }
  }

  if (isApprovedAdmin !== undefined && isApprovedAdmin !== null) {
    queryParams.push(isApprovedAdmin);
    whereClauses.push(`A.is_approved_admin = $${queryParams.length}`);
  }

  if (prizeCategoryId !== undefined && prizeCategoryId !== null) {
    if (+prizeCategoryId === 99) {
      whereClauses.push(`PC.id IS NULL AND A.is_valid = 1 AND A.status = 1`);
    } else {
      queryParams.push(prizeCategoryId);
      whereClauses.push(`PC.id = $${queryParams.length}`);
    }
  }

  const columnMap: Record<string, string> = {
    id: "B.id",
    sender: "A.sender",
    id_number: "B.identity",
    is_valid: "A.is_valid",
    is_approved_admin: "A.is_valid_admin",
    prize: "P.name",
    city: "E.regency_ktp",
    identity: "E.identity",
    created_at: "B.created_at",
    account_number: "B.account_number",
    coupon: "A.coupon",
    store: "S.name",
  };
  const orderBy =
    column && columnMap[column] ? columnMap[column] : "A.rcvd_time";

  // const validColumns = [
  //   "id",
  //   "rcvd_time",
  //   "coupon",
  //   "fullname",
  //   "sender",
  //   "regency",
  //   "store",
  //   "id_number",
  //   "is_valid",
  //   "is_valid_admin",
  //   "is_approved",
  //   "is_approved_admin",
  // ];
  // const orderColumn = validColumns.includes(column || "")
  //   ? column
  //   : "rcvd_time";
  const orderDirection = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const sql = `
        SELECT 
            A.uuid as id, 
            TO_CHAR(A.rcvd_time, 'DD/MM/YYYY HH24:MI:SS') AS rcvd_time,
            A.coupon,
            COALESCE(P.name, '-') AS prize,
            PC.id AS prize_category,
            B.fullname,
            A.sender,
            -- S."name" as store,
            CASE
 			      WHEN S.name is not NULL THEN S.name
  			    ELSE '-'
			      END AS store,
            B.regency_ktp as regency,
            B.identity AS "id_number",
            A.status,
            A.is_valid,
            CASE
                WHEN A.is_valid = 0 AND A.status = 1 THEN 'invalid'
                WHEN A.is_valid = 1 AND A.status IN(2,3) THEN 'process'
                WHEN A.is_valid = 1 AND A.status = 1 THEN 'valid'
                ELSE 'unknown'
            END AS "is_valid_text",
            A.is_valid_admin,
            CASE
                WHEN A.is_valid_admin = 0 THEN 'invalid'
                WHEN A.is_valid_admin = 1 THEN 'valid'
                ELSE 'unprocessed'
            END AS "is_valid_admin_text",
            A.is_approved,
            CASE
                WHEN A.is_approved = 0 THEN 'unprocessed'
                WHEN A.is_approved = 1 THEN 'approved'
                WHEN A.is_approved = 2 THEN 'rejected'
                ELSE 'unknown'
            END AS "is_approved_text",
            A.is_approved_admin,
            CASE
                WHEN A.is_approved_admin = 0 THEN 'unprocessed'
                WHEN A.is_approved_admin = 1 THEN 'approved'
                WHEN A.is_approved_admin = 2 THEN 'rejected'
                ELSE 'unknown'
            END AS "is_approved_admin_text",
            COUNT(*) OVER()::int AS "totalData"
        FROM entries A
        left join store S on A."storeId" = S.id
        LEFT JOIN users B ON A."userId" = B.id
        JOIN media C ON A."mediaId" = C.id
        LEFT JOIN winner W ON A.id = W."entriesId"
        LEFT JOIN prize P ON P.id = W."prizeId"
        LEFT JOIN prize_category PC ON PC.id = P."categoryId"
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT $${queryParams.length + 1}
        OFFSET $${queryParams.length + 2}
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (Entries & { totalData: number })[];

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

export async function getEntriesById(id: string | number) {
  let whereCondition = "";
  const params: unknown[] = [];

  if (id !== undefined && id !== null && String(id) !== "") {
    params.push(id);
    whereCondition = `WHERE A.uuid = $${params.length}`;

    const result = await query(
      `
        SELECT
            A.id,
            A.uuid,
            A.coupon,
            B.fullname,
            B.hp AS sender,
            F.name AS media,
            B.regency_ktp AS regency,
            B.identity AS id_number,
            A.message,
            -- C."name" AS store,
            CASE
 			      WHEN C.name is not NULL THEN C.name
  			    ELSE 'Unknown'
			      END AS store,
            TO_CHAR(A.rcvd_time, 'YYYY-MM-DD HH24:MI:SS') AS rcvd_time,       
            A.is_valid,
            A.is_valid_admin,
            COALESCE(A."invalidReasonAdminId", A."invalidReasonId") AS invalid_reason_id,
            A."storeId" AS store_id,
            -- A.purchase_no_admin,
            -- TO_CHAR(A.purchase_date_admin, 'YYYY-MM-DD HH24:MI:SS') AS purchase_date_admin, 
            -- A.purchase_amount_admin,
            COALESCE(E.name, '-') AS "prize",
            I."name" as invalid
        FROM entries A
        LEFT JOIN users  B ON A."userId" = B.id
        LEFT JOIN store  C ON C.id = A."storeId"
        LEFT JOIN winner D ON D."entriesId" = A.id
        LEFT JOIN prize  E ON D."prizeId" = E.id
        LEFT JOIN media  F ON A."mediaId" = F.id
        left join invalid_reason I on A."invalidReasonId" = I.id
        ${whereCondition};
    `,
      params
    );

    return result.rows[0] as EntriesDetail;
  }

  return;
}

export async function getEntriesImages(id: string | number) {
  let whereCondition = "";
  const params: unknown[] = [];

  if (id !== undefined && id !== null && String(id) !== "") {
    params.push(id);
    whereCondition = `WHERE A.uuid = $${params.length}`;

    const result = await query(
      `
            SELECT
                COALESCE(B.url, '') AS src
            FROM entries A
            LEFT JOIN attachment B ON B."entriesId" = A.id
            ${whereCondition};
        `,
      params
    );

    return result.rows as EntriesDetailImage[];
  }

  return;
}

export async function getEntriesVariant(id: string | number) {
  let whereCondition = "";
  const params: unknown[] = [];

  if (id !== undefined && id !== null && String(id) !== "") {
    params.push(id);
    whereCondition = `WHERE C.uuid = $${params.length}`;

    const result = await query(
      `
        SELECT 
            B.name AS name, 
            A.id AS "entries_id", 
            A."productId" AS "product_id", 
            A.quantity, 
            A.amount AS price, 
            A.total_amount AS "total_price" 
        FROM entries_variant A 
        JOIN product B ON A."productId" = B.id
        JOIN entries C ON A."entriesId" = C.id
        ${whereCondition}
        `,
      params
    );

    return result.rows as EntriesDetailVariant[];
  }

  return;
}

export async function exportEntries(params: Filter) {
  const { key, startDate, endDate, isValid, isValidAdmin, isApprovedAdmin } =
    params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(B.fullname ILIKE $${queryParams.length} OR A.coupon ILIKE $${queryParams.length} OR A.sender ILIKE $${queryParams.length} OR B.identity ILIKE $${queryParams.length})`
    );
  }

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

  if (isValid !== undefined && isValid !== null) {
    queryParams.push(isValid);
    whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
  }

  if (isValidAdmin !== undefined && isValidAdmin !== null) {
    switch (isValidAdmin) {
      case 0:
        whereClauses.push(`A.is_valid_admin IS NULL`);
        break;
      case 1:
        queryParams.push(1);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      case 2:
        queryParams.push(0);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      default:
        break;
    }
  }

  if (isApprovedAdmin !== undefined && isApprovedAdmin !== null) {
    queryParams.push(isApprovedAdmin);
    whereClauses.push(`A.is_approved_admin = $${queryParams.length}`);
  }

  const sql = `
        SELECT 
            A.rcvd_time::TEXT,
            C.name AS media,
            A.id,
            A."userId",
            -- A.message,
            B.fullname AS name,
            A.sender::TEXT,
            B.identity::TEXT AS no_ktp,
            A.coupon AS unique_code,
            B.regency_ktp AS regency,
            CASE WHEN A.is_valid = 1 THEN 'Valid' ELSE 'Invalid' END AS is_valid,
            STRING_AGG(ATT.url, ', ') AS photos,
            CASE WHEN S."name" is not NULL THEN S."name" ELSE '-' END AS store,
            CASE WHEN G."name" is not NULL THEN G."name" ELSE '-' END AS reason_reject,
            COALESCE(D.name, '-') AS invalid_reason,
            D.name AS invalid_reason,
            CASE 
                WHEN A.is_valid_admin = 0 THEN 'Valid' 
                WHEN A.is_valid_admin = 1 THEN 'Invalid' 
                ELSE 'Unprocessed' 
            END AS is_valid_admin, 
            CASE 
                WHEN A.is_approved_admin = 1 THEN 'Approved' 
                WHEN A.is_approved_admin = 2 THEN 'Rejected' 
                ELSE 'Unprocessed' 
            END AS is_approved_admin,
        PR.name AS prize
        FROM entries A
        JOIN users B ON A."userId" = B.id
        LEFT JOIN store S on A."storeId" = S.id
        LEFT JOIN media C ON A."mediaId" = C.id
        LEFT JOIN invalid_reason D ON A."invalidReasonId" = D.id
        LEFT JOIN invalid_reason G ON A."invalidReasonAdminId" = G.id
        LEFT JOIN entries_variant EV ON A.id = EV."entriesId"
        LEFT JOIN product P ON EV."productId" = P.id
        LEFT JOIN winner W ON W."entriesId" = A.id
        LEFT JOIN prize PR ON W."prizeId" = PR.id
        LEFT JOIN attachment ATT ON A.id = ATT."entriesId" 
        WHERE ${whereClauses.join(" AND ")}
        GROUP BY 
            S."name",
            A.id, A.rcvd_time, A."userId", A.message, A.sender, A.coupon,
            A.is_valid, A.is_valid_admin, A.is_approved_admin,
            A.purchase_date_admin, A.purchase_no_admin, A.purchase_amount_admin,
            B.fullname, B.identity, B.regency_ktp, PR.name,
            C.name, D.name, G.name
            
        ORDER BY A.rcvd_time DESC
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}

export async function exportEntriesByCoupon(params: Filter) {
  const { key, startDate, endDate, isValid, isValidAdmin, isApprovedAdmin } =
    params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(B.fullname ILIKE $${queryParams.length} OR A.coupon ILIKE $${queryParams.length} OR A.sender ILIKE $${queryParams.length} OR B.identity ILIKE $${queryParams.length})`
    );
  }

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

  if (isValid !== undefined && isValid !== null) {
    queryParams.push(isValid);
    whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
  }

  if (isValidAdmin !== undefined && isValidAdmin !== null) {
    switch (isValidAdmin) {
      case 0:
        whereClauses.push(`A.is_valid_admin IS NULL`);
        break;
      case 1:
        queryParams.push(1);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      case 2:
        queryParams.push(0);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      default:
        break;
    }
  }

  if (isApprovedAdmin !== undefined && isApprovedAdmin !== null) {
    queryParams.push(isApprovedAdmin);
    whereClauses.push(`A.is_approved_admin = $${queryParams.length}`);
  }

  const sql = `
        SELECT 
            A.rcvd_time,
            A."userId",
            B.fullname,
            TRIM(unnest(string_to_array(A.coupon, ','))) AS voucher_number
        FROM entries A
        LEFT JOIN users B ON A."userId" = B.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY A.rcvd_time ASC, voucher_number ASC
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}

export async function exportEntriesByProducts(params: Filter) {
  const { key, startDate, endDate, isValid, isValidAdmin, isApprovedAdmin } =
    params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(B.fullname ILIKE $${queryParams.length} OR A.coupon ILIKE $${queryParams.length} OR A.sender ILIKE $${queryParams.length} OR B.identity ILIKE $${queryParams.length})`
    );
  }

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

  if (isValid !== undefined && isValid !== null) {
    queryParams.push(isValid);
    whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
  }

  if (isValidAdmin !== undefined && isValidAdmin !== null) {
    switch (isValidAdmin) {
      case 0:
        whereClauses.push(`A.is_valid_admin IS NULL`);
        break;
      case 1:
        queryParams.push(1);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      case 2:
        queryParams.push(0);
        whereClauses.push(`A.is_valid_admin = $${queryParams.length}`);
        break;
      default:
        break;
    }
  }

  if (isApprovedAdmin !== undefined && isApprovedAdmin !== null) {
    queryParams.push(isApprovedAdmin);
    whereClauses.push(`A.is_approved_admin = $${queryParams.length}`);
  }

  const sql = `
        SELECT 
            A.id AS entries_id,
            A.rcvd_time,
            D.fullname AS customer_name,
            C.name AS product_name,
            B.quantity,
            B.amount AS price_per_item,
            B.total_amount AS total_price,
            CASE WHEN A.is_valid = 1 THEN 'Valid' ELSE 'Invalid' END AS entry_status,
            CASE 
                WHEN A.is_valid_admin = 1 THEN 'Valid' 
                WHEN A.is_valid_admin = 2 THEN 'Invalid' 
                ELSE 'Unprocessed' 
            END AS admin_status
        FROM entries A
        JOIN users D ON A."userId" = D.id
        JOIN entries_variant B ON A.id = B."entriesId"
        JOIN product C ON B."productId" = C.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY A.rcvd_time DESC, C.name ASC
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}

export async function findCouponExist(coupon: string) {
  const result = await query(
    `
        SELECT coupon 
        FROM entries
        WHERE $1 = ANY(
            string_to_array(
                regexp_replace(coupon, '\s+', '', 'g'),
                ','
            )
        )
        `,
    [coupon.trim()]
  );
  return result.rows;
}

export async function checkReceiptDuplicate({
  purchase_no_admin,
  entries_id,
}: {
  purchase_no_admin: string;
  entries_id: number;
}) {
  const result = await query(
    `
        SELECT 
            id, 
            sender
        FROM entries 
        WHERE purchase_no_admin = $1 
        AND id != $2
        `,
    [purchase_no_admin, entries_id]
  );

  return result.rows as { id: number; sender: string }[];
}

export async function checkImageDuplicate(id: number) {
  const result = await query(
    `
        SELECT 
            url 
        FROM attachment 
        JOIN (SELECT id FROM entries) AS entries ON attachment."entriesId" = entries.id WHERE entries.id = $1
        `,
    [id]
  );

  return result.rows[0] as { url: string };
}

export async function saveEntriesData(data: SaveEntries) {
  return await withTransaction(async (client) => {
    const { userId, entries } = data;

    const exists = await client.query(
      'SELECT COUNT(*)::int AS count FROM entries_variant EV WHERE EV."entriesId" = $1',
      [entries.id]
    );

    if (exists.rows[0].count > 0) {
      await client.query('DELETE FROM entries_variant WHERE "entriesId" = $1', [
        entries.id,
      ]);
    }

    // const total =
    //     entriesVariant && entriesVariant.length > 0
    //         ? await Promise.all(
    //               entriesVariant.map(async (ev) => {
    //                   const totalPrice = ev.quantity * ev.price;
    //                   await client.query(
    //                       `INSERT INTO entries_variant ("entriesId", "productId", quantity, amount, total_amount)
    //                        VALUES ($1, $2, $3, $4, $5)`,
    //                       [entries.id, ev.product_id, ev.quantity, ev.price, totalPrice]
    //                   );
    //                   return totalPrice;
    //               })
    //           ).then((values) => values.reduce((sum, val) => sum + val, 0))
    //         : 0;

    const is_valid = entries.is_valid || 0;
    const invalid_id = !is_valid ? entries.invalid_reason_id : null;

    const isValidClause =
      is_valid == 1
        ? `is_valid_admin = 1,`
        : `is_valid_admin = 0, is_approved_admin = 2, "approvedById_admin" = ${userId}, approved_date = NOW(),`;
    await client.query(
      `
            UPDATE entries
            SET
                -- purchase_no_admin = $1,
                -- purchase_amount_admin = $2,
                -- purchase_date_admin = $3,
                -- store_name_admin = $4,
                ${isValidClause}
                updated_at = NOW(),
                "invalidReasonAdminId" = $1
            WHERE id = $2
            `,
      [invalid_id, entries.id]
    );

    return { invalid_id };
  });
}

export async function approveEntries({
  entries_id,
  invalid_id,
  userId,
  is_valid,
}: {
  entries_id: number;
  invalid_id: number | null;
  userId: number;
  is_valid: number;
}) {
  return await withTransaction(async (client) => {
    const setClauses = [];

    if (is_valid === 1) {
      setClauses.push(`is_valid_admin = 1`);
      setClauses.push(`is_approved_admin = 1`);
      setClauses.push(`"approvedById_admin" = ${userId}`);
      setClauses.push(`approved_date = NOW()`);
      setClauses.push(`updated_at = NOW()`);
    } else {
      setClauses.push(`is_valid_admin = 0`);
      setClauses.push(`is_approved_admin = 2`);
      setClauses.push(`"approvedById_admin" = ${userId}`);
      setClauses.push(`approved_date = NOW()`);
      setClauses.push(`updated_at = NOW()`);
      setClauses.push(`"invalidReasonAdminId" = ${invalid_id}`);
    }

    await client.query(
      `
        UPDATE 
            entries 
        SET 
            ${setClauses.join(", ")}
        WHERE id = $1
        `,
      [entries_id]
    );

    return true;
  });
}
