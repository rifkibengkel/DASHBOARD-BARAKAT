import { query } from "@/lib/db/postgres";
import { UserHistory } from "@/types";

export async function getUserHistory(id: string | number) {
  const result = await query(
    `
    SELECT COALESCE
    (w.created_at, e.created_at) AS created_at,
    COALESCE (e.coupon, '') AS coupon,
    CASE
        WHEN e.is_valid = 1 THEN
        'Valid'
        WHEN e.is_valid = 0 THEN
        'Invalid'
    END AS is_valid,
    CASE
        WHEN w.is_approved = 1 THEN
        'Approved'
        WHEN w.is_approved = 2 THEN
        'Rejected'
        WHEN w.is_approved = 0 THEN
        CASE
            WHEN e.is_approved = 1 THEN
            'Approved'
            WHEN e.is_approved = 2 THEN
            'Rejected'
            WHEN e.is_approved = 0 THEN
            'Unprocessed'
            ELSE
            '-'
        END
        ELSE
        CASE
            WHEN e.is_valid_admin = 1 THEN
            'Approved'
            WHEN e.is_valid_admin = 0 THEN
            'Rejected'
            ELSE
            'Unprocessed'
        END
    END AS approval_status,
    COALESCE (REPLACE(pc.name, 'Hadiah ', ''), '-') AS prize_category,
        COALESCE (p.name, '-') AS prize_name,
        CASE
            WHEN w.TYPE = 3 THEN
            CASE
                WHEN w.is_approved = 1 THEN
                CASE
                    WHEN w.shipment_status = NULL THEN
                    'Approved'
                    WHEN w.shipment_status = 1 THEN
                    'Send to SAP'
                    WHEN w.shipment_status = 2 THEN
                    'On Shipping'
                    WHEN w.shipment_status = 3 THEN
                    'Completed'
                    ELSE
                    '-'
                END
                ELSE
                'Unprocessed'
            END
            ELSE
            CASE
                WHEN w.status = 0 THEN
                'Unprocessed'
                WHEN w.status = 1 THEN
                'Process Topup'
                WHEN w.status = 2 THEN
                'Success Topup'
                WHEN w.status = 3 THEN
                'Failed Topup'
                ELSE
                '-'
            END
        END AS fulfillment_status
        FROM
            entries e
            LEFT JOIN winner w ON e.id = w."entriesId"
            LEFT JOIN prize p ON w."prizeId" = p.id
            LEFT JOIN prize_category pc ON p."categoryId" = pc.id
            LEFT JOIN prize_type pt ON p."typeId" = pt.id
            LEFT JOIN "transaction" t ON t."winnerId" = t.id
        WHERE
            e."userId" = $1 AND e.is_valid = 1
        ORDER BY
            e.created_at
        `,
    [id]
  );

  return result.rows as UserHistory[];
}
