import { query, withTransaction } from "@/lib/db/postgres";
import {
  Filter,
  Pagination,
  TopupHistory,
  Winner,
  WinnerDetail,
  WinnerDetailImage,
} from "@/types";
import dayjs from "dayjs";

export async function getWinnerList(params: Filter & Pagination) {
  const {
    prize,
    prizeId,
    isApproved,
    status,
    key,
    startDate,
    endDate,
    column,
    direction,
    page = 1,
    limit = 10,
  } = params;

  const offset = (Number(page) - 1) * Number(limit);
  const queryParams: (string | number)[] = [];
  const whereClauses: string[] = ["1=1"];

  if (prize === "digital") {
    whereClauses.push(`P."categoryId" = 2`);
  }

  if (prize === "physical") {
    whereClauses.push(`P."categoryId" = 1`);
  }

  if (prizeId !== undefined && prizeId !== null && String(prizeId) !== "") {
    queryParams.push(prizeId);
    whereClauses.push(`B."prizeId" = $${queryParams.length}`);
  }

  if (isApproved !== undefined && isApproved !== null) {
    queryParams.push(isApproved);
    whereClauses.push(`B.is_approved = $${queryParams.length}`);
  }

  if (status !== undefined && status !== null) {
    queryParams.push(status);
    whereClauses.push(`B.status = $${queryParams.length}`);
  }

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(E.fullname ILIKE $${queryParams.length} OR E.identity ILIKE $${queryParams.length} OR E.hp ILIKE $${queryParams.length} OR A.coupon ILIKE $${queryParams.length} OR P.name ILIKE $${queryParams.length})`
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

  const columnMap: Record<string, string> = {
    id: "B.id",
    prize: "P.name",
    city: "E.regency_ktp",
    identity: "E.identity",
    created_at: "B.created_at",
    updated_at: "B.updated_at",
    fullname: "E.fullname",
    identitas: "E.identity",
    hp: "B.account_number",
    account_number: "B.account_number",
    coupon: "A.coupon",
    prize_name: "P.name",
    store: "S.name",
    status: "B.status",
    status_dynamic: "B.status",
    is_approved: "B.is_approved",
  };

  const orderBy =
    column && columnMap[column] ? columnMap[column] : "B.created_at";

  // const validColumns = [
  //   "id",
  //   "created_at",
  //   "updated_at",
  //   "fullname",
  //   "identitas",
  //   "hp",
  //   "account_number",
  //   "prize_name",
  //   "coupon",
  //   "name",
  //   "status",
  //   "is_approved",
  // ];
  // const orderColumn = validColumns.includes(column || "")
  //   ? column
  //   : "created_at";

  const orderDirection = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const digital = prize === "digital";
  const shipmentColumns = digital
    ? ""
    : `
        B.shipment_status AS shipment_status,
        CASE
            WHEN B.shipment_status = 0 THEN 'UNPROCESSED'
            WHEN B.shipment_status = 1 THEN 'SEND TO SAP'
            WHEN B.shipment_status = 2 THEN 'ON SHIPPING'
            WHEN B.shipment_status = 3 THEN 'COMPLETED'
            ELSE 'NULL'
        END AS shipment_status_text,
        B.shipment_process_date,`;

  const sql = `
        SELECT
            B.id,
            B."entriesId" AS entries_id,
            S."name" AS store,
            B."userId" AS user_id,
            B."prizeId" AS prize_id,
            CASE WHEN S."name" is not NULL THEN S."name" ELSE '-' END AS store,
            TO_CHAR(B.created_at, 'DD/MM/YYYY HH24:MI:SS') AS created_at,
            TO_CHAR(B.updated_at, 'DD/MM/YYYY HH24:MI:SS') AS last_updated,
            E.fullname,
            E.identity,
            B.account_number AS hp,
            A.coupon,
            B.status,
            A.status AS status_entries,
            P.name AS prize,
            (F.name || ' ' || F.amount::text) AS voucher,
            CASE
                WHEN B.status = 0 THEN 'unprocessed'
                WHEN B.status = 1 THEN 'processed'
                WHEN B.status = 2 THEN 'success'
                WHEN B.status = 3 THEN 'failed'
                ELSE 'unknown'
            END AS status_text,
            B.is_approved,
            CASE
                WHEN B.is_approved = 0 THEN 'unprocessed'
                WHEN B.is_approved = 1 THEN 'approved'
                WHEN B.is_approved = 2 THEN 'rejected'
                ELSE 'unknown'
            END AS is_approved_text,
            E.regency_ktp AS city,
            ${shipmentColumns}
            COUNT(*) OVER()::int AS "totalData"
        FROM winner B
        LEFT JOIN entries A ON B."entriesId" = A.id
        LEFT JOIN users E ON E.id = B."userId"
        LEFT JOIN voucher F ON B."voucherId" = F.id
        left join store S on A."storeId" = S.id 
        LEFT JOIN media G ON A."mediaId" = G.id
        LEFT JOIN prize P ON B."prizeId" = P.id
        WHERE ${whereClauses.join(" AND ")}
        GROUP BY
            B.id, A.id, E.fullname, E.hp, E.id_type, G.id, E.identity, P.name, F.name, F.amount, E.regency_ktp, S.name
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT $${queryParams.length + 1}
        OFFSET $${queryParams.length + 2}
    `;

  queryParams.push(Number(limit), offset);

  const result = await query(sql, queryParams);
  const rows = result.rows as (Winner & { totalData: number })[];

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

export async function getPreviousWinnerIdFromUser(id: string | number) {
  const result1 = await query(
    `
        SELECT
        A."userId"
        FROM winner A
        WHERE A.id = $1 
    `,
    [id]
  );

  const result2 = await query(
    `
        SELECT
        U."winnerId"
        FROM users U
        WHERE U.id = $1
    `,
    [result1.rows[0].userId]
  );

  const result = result2.rows[0].winnerId;

  return result;
}

export async function getWinnerById(id: string | number) {
  let whereCondition = "";
  const params: unknown[] = [];

  if (id !== undefined && id !== null && String(id) !== "") {
    params.push(id);
    whereCondition = `WHERE A.id = $${params.length}`;

    const result = await query(
      `
        SELECT
            A.id,
            A."allocationId" AS allocation_id,
            A."entriesId" AS entries_id,
            B.coupon,
            D.fullname,
            A.account_number AS sender,
            D.identity AS id_number,
            D.regency_ktp AS regency,
            F.name AS media,
            C.name AS prize,
            A."invalidReasonId" AS invalid_reason_id,
            A.is_approved,
            TO_CHAR(A.created_at, 'YYYY-MM-DD') AS rcvd_time,
             (E.name || ' ' || E.amount::text) AS voucher,
             CASE WHEN S."name" is not NULL THEN S."name" ELSE '-' END AS store,
            CASE
              WHEN D.is_ktp_valid = 1 THEN B.ktp_name_admin 
              ELSE A.ktp_name_admin
            END AS ktp_name_admin,
            CASE
              WHEN D.is_ktp_valid = 1 THEN B.id_number_admin 
              ELSE A.id_number_admin
            END AS id_number_admin
        FROM winner A
        LEFT JOIN entries B ON A."entriesId" = B.id
        LEFT JOIN store S on B."storeId" = S.id
        LEFT JOIN prize C ON A."prizeId" = C.id
        LEFT JOIN voucher E ON A."voucherId" = E.id
        LEFT JOIN media F ON B."mediaId" = F.id
        LEFT JOIN users D ON A."userId" = D.id
        ${whereCondition};
    `,
      params
    );

    return result.rows[0] as WinnerDetail;
  }

  return;
}

export async function getWinnerImage(id: string | number) {
  let whereCondition = "";
  const params: unknown[] = [];

  if (id !== undefined && id !== null && String(id) !== "") {
    params.push(id);
    whereCondition = `WHERE A.id = $${params.length} AND C.is_deleted = 0`;

    const result = await query(
      `
        SELECT
          COALESCE(C.url, '') AS src
        FROM winner A
        LEFT JOIN attachment C
          ON (
            (A."entriesId" IS NULL AND C."winnerId" = A.id)
            OR
            (A."entriesId" IS NOT NULL AND C."entriesId" = A."entriesId")
          )
        ${whereCondition}
        ORDER BY C.type ASC;
      `,
      params
    );

    return result.rows as WinnerDetailImage[];
  }

  return;
}

export async function getWinnerHistory(id: string | number) {
  const result = await query(
    `
        SELECT
            U.fullname,
            W.created_at AS rcvd_time,
            W.account_number AS hp,
            U.regency_ktp AS regency,
            (V.name || ' ' || V.amount::text) AS voucher,
            W.is_approved,
            W.status,
            S."name" as store,
            I."name" as reason,
            U."identity",
            E.id_number_admin,
            E.ktp_name_admin,
            CASE WHEN S."name" is not NULL THEN S."name" ELSE '-' END AS store,
            CASE
                WHEN W.status = 0 THEN 'unprocessed'
                WHEN W.status = 1 THEN 'processed'
                WHEN W.status = 2 THEN 'success'
                WHEN W.status = 3 THEN 'failed'
                ELSE 'unknown'
            END AS status_text,
            P.name AS prize
        FROM winner W
        LEFT JOIN users U ON W."userId" = U.id 
        left join invalid_reason I on W."invalidReasonId" = I.id 
        left join entries E on W."entriesId" = E.id 
        left join store S on E."storeId" = S.id 
        LEFT JOIN prize P ON W."prizeId" = P.id
        LEFT JOIN voucher V ON W."voucherId" = V.id
        WHERE W.id = $1
        `,
    [id]
  );

  return result.rows[0] as Pick<
    TopupHistory,
    "fullname" | "rcvd_time" | "hp" | "regency" | "status" | "status_text"
  >;
}

export async function getWinnerTransactionHistory(id: string | number) {
  const result = await query(
    `
        SELECT
            created_at,
            reference,
            code,
            reason,
            tr_id,
            amount,
            status,
            CASE
                WHEN status = 0 THEN 'unprocessed'
                WHEN status = 1 THEN 'processed'
                WHEN status = 2 THEN 'success'
                WHEN status = 3 THEN 'failed'
                ELSE 'unknown'
            END AS status_text
        FROM
        transaction
        WHERE "winnerId" = $1
        ORDER BY
            updated_at DESC
        `,
    [id]
  );

  return result.rows;
}

export async function getGeneralParameter(name: string) {
  const result = await query(
    `
        SELECT
            value
        FROM
        general_parameter
        WHERE name = $1
        `,
    [name]
  );

  return result.rows[0].value;
}

export async function addWinnerAttachment({
  id,
  user_id,
  url,
}: {
  id: string | number;
  user_id: number;
  url: string;
}) {
  return withTransaction(async (client) => {
    const getDetail = await client.query(
      `
        SELECT
          a."entriesId",
          a."mediaId",
          a."userId",
          a.sender
        FROM
          winner w
          LEFT JOIN attachment a ON a."entriesId" = w."entriesId"
        WHERE
          w.id = $1
          LIMIT 1
            `,
      [id]
    );

    const { entriesId, mediaId, userId, sender } = getDetail.rows[0];
    await client.query(
      `
        INSERT INTO attachment ("entriesId", "mediaId", "userId", url, sender, "createdById", "winnerId", type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
            `,
      [entriesId, mediaId, userId, url, sender, user_id, id, 3]
    );
    return true;
  });
}

export async function deleteWinnerAttachment({
  user_id,
  url,
}: {
  user_id: number;
  url: string;
}) {
  const result = await query(
    `
      UPDATE attachment
      SET is_deleted = 1,
          deleted_at = NOW(),
          "deletedById" = $1
      WHERE url = $2
        `,
    [user_id, url]
  );

  return result.rowCount;
}

export async function rejectWinner({
  id,
  invalid_id,
  user_id,
  allocation_id,
}: {
  id: string | number;
  invalid_id: string | number;
  user_id: number;
  allocation_id: number;
}) {
  return withTransaction(async (client) => {
    await client.query(
      `
            UPDATE allocation
            SET status = 0,
                used_date = NULL
            WHERE id = $1
            `,
      [allocation_id]
    );

    const exe = await client.query(
      `
        WITH updated_winner AS (
          UPDATE winner AS w
          SET
            status = 3,
            "allocationId" = NULL,
            "invalidReasonId" = $1,
            updated_at = NOW(), 
            "updatedById" = $2,
            is_approved = 2
          WHERE id = $3
          RETURNING w."entriesId", w."userId"
        )
        UPDATE entries AS e
          SET 
            is_valid_admin = 0,
            is_approved_admin = 2,
            updated_at = NOW(),
            approved_date = NOW(),
            "invalidReasonAdminId" = $1,
            "updatedById" = $2,
            "approvedById_admin" = $2
          FROM updated_winner AS uw
          WHERE e.id = uw."entriesId"
            `,
      [invalid_id, user_id, id]
    );

    return true;
  });
}

export async function updateWinnerImageLabels({
  id,
  user_id,
  image_labels,
}: {
  id: string | number;
  user_id: number;
  image_labels: Record<string, string>;
}) {
  return withTransaction(async (client) => {
    const data: Record<string, string> = image_labels;

    for (const [key, value] of Object.entries(data)) {
      const type = value === "kk" ? 3 : value === "ktp" ? 2 : 1;
      await client.query(
        `
          UPDATE attachment
          SET type = $1,
              updated_at = NOW(),
              is_pinned = TRUE,
              "updatedById" = $2
          WHERE "winnerId" = $3 AND sort = $4
          `,
        [type, user_id, id, +key + 1]
      );
    }
    return true;
  });
}

export async function approveWinner({
  user_id,
  id_number_admin,
  ktp_name_admin,
  id,
}: {
  user_id: number;
  id_number_admin: string;
  ktp_name_admin: string;
  id: string | number;
  sap_payload?: string;
}) {
  return withTransaction(async (client) => {
    await client.query(
      // `
      //   WITH updated_winner AS (
      //     UPDATE winner AS w
      //     SET
      //       is_approved = 1,
      //       updated_at = NOW(),
      //       "updatedById" = $1,
      //       id_number_admin = $2,
      //       ktp_name_admin = $3,
      //       status = CASE WHEN w.type = 3 THEN 1 ELSE w.status END
      //     WHERE w.id = $4
      //     RETURNING w."entriesId", w."userId"
      //   ),
      //   updated_entries AS (
      //     UPDATE entries AS e
      //     SET
      //       is_valid_admin = 1,
      //       is_approved_admin = 1,
      //       updated_at = NOW(),
      //       approved_date = NOW(),
      //       "updatedById" = $1,
      //       "approvedById_admin" = $1
      //     FROM updated_winner AS uw
      //     WHERE e.id = uw."entriesId"
      //   )
      //   UPDATE users AS us
      //   SET
      //     is_approve_admin = 1,
      //     "winnerId" = $4,
      //     updated_at = NOW()
      //   FROM updated_winner AS uw
      //   WHERE us.id = uw."userId";
      // `,
      `
        WITH updated_winner AS (
          UPDATE public.winner AS w
          SET 
            is_approved = 1,
            updated_at = NOW(),
            "updatedById" = $1,
            id_number_admin = $2,
            ktp_name_admin = $3,
            status = CASE WHEN w.type = 3 THEN 1 ELSE w.status END
            WHERE w.id = $4
          RETURNING w."entriesId", w."userId"
        ),
        updated_entries AS (
          UPDATE public.entries AS e
          SET 
            is_valid_admin = 1,
            is_approved_admin = 1,
            updated_at = NOW(),
            approved_date = NOW(),
            "updatedById" = $1,
            "approvedById_admin" = $1,
            id_number_admin = $2,
            ktp_name_admin = $3
          FROM updated_winner AS uw
          WHERE e.id = uw."entriesId"
        )
        UPDATE public.users AS us
          SET 
          is_approve_admin = 1,
          "winnerId" = $4,
          updated_at = NOW()
          FROM updated_winner AS uw
        WHERE us.id = uw."userId";
      `,
      [user_id, id_number_admin, ktp_name_admin, id]
    );

    return true;
  });
}

export async function setShipment({
  id,
  user_id,
}: {
  id: string;
  user_id: number;
}) {
  return withTransaction(async (client) => {
    await client.query(
      `
       UPDATE winner
       SET
          shipment_status = 1,
          shipment_process_date = NOW(),
          updated_at = NOW(),
          "updatedById" = $1
       WHERE id = $2
      `,
      [user_id, id]
    );
    return true;
  });
}

export async function setShipmentDelivered({
  id,
  user_id,
}: {
  id: number;
  user_id: number;
}) {
  return withTransaction(async (client) => {
    await client.query(
      `
       UPDATE winner
       SET
          shipment_status = 2,
          shipment_process_date = NOW(),
          updated_at = NOW(),
          "updatedById" = $1
       WHERE id = $2
      `,
      [user_id, id]
    );
    return true;
  });
}

export async function setShipmentReceived({
  id,
  user_id,
}: {
  id: number;
  user_id: number;
}) {
  return withTransaction(async (client) => {
    await client.query(
      `
            UPDATE winner
            SET
                shipment_status = 3,
                shipment_received_date = NOW(),
                updated_at = NOW(),
                "updatedById" = $1
            WHERE id = $2
            `,
      [user_id, id]
    );
    return true;
  });
}

export async function exportWinner(params: Filter) {
  const { key, startDate, endDate, status, isApproved, type } = params;
  const whereClauses: string[] = ["1=1"];
  const queryParams: (string | number)[] = [];
  let validColumns = ``;

  if (type === "digital") {
    // whereClauses.push(`A."voucherId" IS NOT NULL`);
    whereClauses.push(`P."categoryId" = 2`);
    validColumns = `,
                    CASE
                        WHEN A.status = 0 THEN 'UNPROCESSED'
                        WHEN A.status = 1 THEN 'PROCESSED'
                        WHEN A.status = 2 THEN 'SUCCESS'
                        WHEN A.status = 3 THEN 'FAILED'
                        ELSE '-'
                    END AS status,
                    CASE
                        WHEN A.is_approved = 0 THEN 'UNPROCESSED'
                        WHEN A.is_approved = 1 THEN 'APPROVED'
                        WHEN A.is_approved = 2 THEN 'REJECTED'
                        ELSE '-'
                    END AS approval_status,
                    COALESCE(V."name", '-') AS voucher_name,
                    COALESCE(IR."name", '-') AS reject_reason,
                    COALESCE(T.proccesed_date::TEXT, '-') AS proccesed_date,
                    COALESCE(T.tr_id, '-') AS serial_number,
                    COALESCE(T.reference, '-') AS reference`;
  } else if (type === "physical") {
    whereClauses.push(`A."voucherId" IS NULL AND P."categoryId" = 1`);
    validColumns = `,
                    CASE
                        WHEN A.shipment_status = NULL THEN
                        'Approved'
                        WHEN A.shipment_status = 1 THEN
                        'Send to SAP'
                        WHEN A.shipment_status = 2 THEN
                        'On Shipping'
                        WHEN A.shipment_status = 3 THEN
                        'Completed'
                        ELSE
                        '-'
                    END AS shipment_status,
                    COALESCE(A.shipment_process_date::TEXT, '-') AS shipment_process_date,
                    COALESCE(A.shipment_received_date::TEXT, '-') AS shipment_received_date`;
  }

  if (key) {
    queryParams.push(`%${key}%`);
    whereClauses.push(
      `(B.fullname ILIKE $${queryParams.length} OR A.hp ILIKE $${queryParams.length} OR B.identity ILIKE $${queryParams.length} OR E.coupon ILIKE $${queryParams.length} OR P.name ILIKE $${queryParams.length})`
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

  if (status !== undefined && status !== null) {
    queryParams.push(status);
    whereClauses.push(`A.status = $${queryParams.length}`);
  }

  if (isApproved !== undefined && isApproved !== null) {
    queryParams.push(isApproved);
    whereClauses.push(`A.is_approved = $${queryParams.length}`);
  }

  const sql = `
                SELECT 
                    A.created_at::TEXT,
                    A.id AS winner_id,
                    E.id AS entries_id,
                    B.id AS user_id,
                    B.fullname AS name,
                    B.identity::TEXT AS no_ktp,
                    B.regency_ktp AS regency,
                    A.account_number,
                    P."name" AS prize,
                    E.coupon AS unique_code,
                    STRING_AGG(ATT.url, ', ') AS photos,
                    CASE
                    WHEN P."categoryId" = 1 THEN 'HADIAH FISIK'
                    WHEN P."categoryId" = 2 THEN 'HADIAH DIGITAL'
                        ELSE '-'
                    END AS type_prize
                    ${validColumns}
                FROM winner A
                LEFT JOIN entries E ON A."entriesId" = E.id
                LEFT JOIN users B ON A."userId" = B.id
                LEFT JOIN prize P ON A."prizeId" = P.id 
                LEFT JOIN prize_category PC ON P."categoryId" = PC.id
                LEFT JOIN voucher V ON A."voucherId" = V.id
                LEFT JOIN "transaction" T ON T."winnerId" = A.id
                LEFT JOIN invalid_reason IR ON A."invalidReasonId" = IR.id
                LEFT JOIN attachment ATT ON E.id = ATT."entriesId" 
                WHERE ${whereClauses.join(" AND ")}
                GROUP BY 
                    A.id, A.created_at, A.account_number, A.amount, A.status, 
                    A.is_approved, A."prizeId", A."voucherId", 
                    E.id, B.id, B.fullname, B.identity, B.regency,
                    P."name", P."categoryId", V."name", IR."name", 
                    T.tr_id, T.reference, T.proccesed_date
                ORDER BY A.created_at DESC;
    `;

  const result = await query(sql, queryParams);
  return result.rows;
}

export async function changeWinnerAccount({
  winner_id,
  hp,
  user_id,
}: {
  winner_id: number;
  hp: string;
  user_id: number;
}) {
  return withTransaction(async (client) => {
    await client.query(
      `
            UPDATE winner
            SET account_number = $1,
            "updatedById" = $2,
            updated_at = NOW()
            WHERE id = $3
            `,
      [hp, user_id, winner_id]
    );

    return true;
  });
}
