import { query, withTransaction } from '@/lib/db/postgres';
import { Menu, Filter } from '@/types';

export async function getMenuList(params: Filter) {
    const { key, column, direction } = params;

    const searchKey = key ? `%${key}%` : null;

    const validColumns = ['id', 'description', 'path', 'level', 'sort', 'status'];
    const orderColumn = validColumns.includes(column || '') ? column : 'sort';
    const orderDirection = direction?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const whereClauses: string[] = ['1=1'];
    const queryParams: (number | string)[] = [];

    if (searchKey) {
        queryParams.push(searchKey);
        whereClauses.push(`M.description ILIKE $${queryParams.length} OR M.path ILIKE $${queryParams.length}`);
    }

    const sql = `
        SELECT 
            M.id,
            M.description AS "menu",
            M.path,
            M.level,
            M.header AS "sub",
            M.icon,
            M.sort,
            M.status,
            CASE
                WHEN M.status = 0 THEN 'inactive'
                WHEN M.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text",
            COUNT(*) OVER()::int AS "totalData"
        FROM menu M
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY M.${orderColumn} ${orderDirection}
    `;

    const result = await query(sql, queryParams);
    const rows = result.rows as (Menu & { totalData: number })[];

    const totalData = rows.length > 0 ? rows[0].totalData : 0;

    return {
        list: rows,
        dataPerPage: totalData,
        currentPage: 1,
        totalData,
        totalPage: 1,
    };
}

export async function getMenuById(id: number) {
    if (!id) throw new Error('getMenuById requires a valid ID');

    const result = await query(
        `
        SELECT
            M.id,
            M.description AS "menu",
            M.path,
            M.level,
            M.header AS "sub",
            M.icon,
            M.sort,
            M.status,
            CASE
                WHEN M.status = 0 THEN 'inactive'
                WHEN M.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text"
        FROM menu M
        WHERE M.id = $1
        ORDER BY M.sort;
        `,
        [id]
    );

    return result.rows[0] as Menu;
}

export async function insertMenu({ userId, menu }: { userId: number; menu: Omit<Menu, 'status_text'> }) {
    return withTransaction(async (client) => {
        const params = [menu.menu, menu.path, menu.level, menu.sub, menu.icon, menu.sort, menu.status, userId];

        const result = await client.query(
            `
            INSERT INTO menu (description, path, level, header, icon, sort, status, "createdById")
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8);
            `,
            params
        );

        return result.rows[0] as Menu;
    });
}

export async function updateMenu({
    id,
    userId,
    menu,
}: {
    id: number;
    userId: number;
    menu: Omit<Menu, 'status_text'>;
}) {
    return withTransaction(async (client) => {
        const params = [menu.menu, menu.path, menu.level, menu.sub, menu.icon, menu.sort, menu.status, userId, id];

        const result = await client.query(
            `
            UPDATE menu
            SET 
                description = $1,
                path = $2,
                level = $3,
                header = $4,
                icon = $5,
                sort = $6,
                status = $7,
                updated_at = NOW(),
                "updatedById" = $8
            WHERE id = $9;
        `,
            params
        );

        return result.rows[0] as Menu;
    });
}
