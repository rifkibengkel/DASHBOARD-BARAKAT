import { query, withTransaction } from '@/lib/db/postgres';
import { Filter, Pagination, Roles, RolesDetail } from '@/types';

export async function getRolesList(params: Filter & Pagination) {
    const { key, column, direction, page, limit } = params;

    const offset = (Number(page) - 1) * Number(limit);
    const searchKey = key ? `%${key}%` : null;

    const validColumns = ['id', 'description', 'status'];
    const orderColumn = validColumns.includes(column || '') ? column : 'id';
    const orderDirection = direction?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const whereClauses: string[] = ['1=1'];
    const queryParams: (number | string)[] = [];

    if (searchKey) {
        queryParams.push(searchKey);
        whereClauses.push(`A.description ILIKE $${queryParams.length}`);
    }

    const sql = `
        SELECT 
            A.id,
            A.description AS "role",
            A.status,
            CASE
                WHEN A.status = 0 THEN 'inactive'
                WHEN A.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text",
            COUNT(*) OVER()::int AS "totalData"
        FROM access A
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY A.${orderColumn} ${orderDirection}
        LIMIT $${queryParams.length + 1}
        OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(Number(limit), offset);

    const result = await query(sql, queryParams);
    const rows = result.rows as (Roles & { totalData: number })[];

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

export async function getRolesById(id: number) {
    let whereCondition = '';
    const params: unknown[] = [];

    if (id !== undefined && id !== null && String(id) !== '') {
        params.push(id);
        whereCondition = `WHERE A.id = $${params.length}`;
    }

    const result = await query(
        `
        SELECT 
            A.id,
            A.description AS "role",
            A.status,
            CASE
                WHEN A.status = 0 THEN 'inactive'
                WHEN A.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text",
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'menuId', M.id,
                    'menu', M.description,
                    'm_insert', COALESCE(D.m_insert, 0),
                    'm_update', COALESCE(D.m_update, 0),
                    'm_delete', COALESCE(D.m_delete, 0),
                    'm_view', COALESCE(D.m_view, 0)
                ) ORDER BY M.sort
            ) AS menu
        FROM access A
        CROSS JOIN menu M
        LEFT JOIN access_det D ON D."accessId" = A.id AND D."menuId" = M.id
        ${whereCondition}
        GROUP BY A.id, A.description, A.status;
        `,
        params
    );

    return result.rows[0] as RolesDetail;
}

export async function insertRole({ userId, role, status }: { userId: number; role: string; status: number }) {
    return await withTransaction(async (client) => {
        const result = await client.query(
            `INSERT INTO access (description, status, "createdById") VALUES ($1, $2, $3)`,
            [role, status, userId]
        );
        return result.rows[0] as Roles;
    });
}

export async function updateRole({
    id,
    role,
    status,
    userId,
}: {
    id: number;
    role: string;
    status: number;
    userId: number;
}) {
    return await withTransaction(async (client) => {
        const result = await client.query(
            `UPDATE access SET description = $1, status = $2, updated_at = NOW(), "updatedById" = $3 WHERE id = $4`,
            [role, status, userId, id]
        );
        return result.rows[0] as Roles;
    });
}

export async function updateRoleMenu({
    userId,
    roleId,
    menus,
}: {
    userId: number;
    roleId: number;
    menus: Array<{
        menuId: number;
        m_insert: 0 | 1;
        m_update: 0 | 1;
        m_delete: 0 | 1;
        m_view: 0 | 1;
    }>;
}) {
    return await withTransaction(async (client) => {
        for (let idx = 0; idx < menus.length; idx++) {
            const menu = menus[idx];
            const exists = await client.query('SELECT 1 FROM access_det WHERE "accessId" = $1 AND "menuId" = $2', [
                roleId,
                menu.menuId,
            ]);
            if (exists.rowCount && exists.rowCount > 0) {
                await client.query(
                    `UPDATE access_det SET m_insert = $1, m_update = $2, m_delete = $3, m_view = $4, sort = $5, updated_at = NOW(), "updatedById" = $6
           WHERE "accessId" = $7 AND "menuId" = $8`,
                    [menu.m_insert, menu.m_update, menu.m_delete, menu.m_view, idx + 1, userId, roleId, menu.menuId]
                );
            } else {
                await client.query(
                    `INSERT INTO access_det ("accessId", "menuId", m_insert, m_update, m_delete, m_view, sort, "createdById")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [roleId, menu.menuId, menu.m_insert, menu.m_update, menu.m_delete, menu.m_view, idx + 1, userId]
                );
            }
        }
    });
}
