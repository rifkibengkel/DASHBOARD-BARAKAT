import { query, withTransaction } from '@/lib/db/postgres';
import { Filter, Pagination, Users } from '@/types';

export async function getUsersList(params: Filter & Pagination) {
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
        whereClauses.push(
            `B.description ILIKE $${queryParams.length} OR A.fullname ILIKE $${queryParams.length} OR A.username ILIKE $${queryParams.length}`
        );
    }

    const sql = `
             SELECT 
                A.id,
                B.description AS "role",
                A.username,
                A.fullname,
                A.status,
                CASE
                    WHEN A.status = 0 THEN 'inactive'
                    WHEN A.status = 1 THEN 'active'
                    ELSE 'unknown'
                END AS "status_text",
            COUNT(A.*) OVER()::int AS "totalData"
            FROM user_mobile A
            INNER JOIN access B ON A."accessId" = B.id
            WHERE ${whereClauses.join(' AND ')}
            ORDER BY A.${orderColumn} ${orderDirection}
            LIMIT $${queryParams.length + 1}
            OFFSET $${queryParams.length + 2}
        `;

    queryParams.push(Number(limit), offset);

    const result = await query(sql, queryParams);
    const rows = result.rows as (Users & { totalData: number })[];

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

export async function getUserById(id: number) {
    let whereCondition = '';
    const params: unknown[] = [];

    if (id !== undefined && id !== null && String(id) !== '') {
        params.push(id);
        whereCondition = `WHERE A.id = $${params.length}`;
    }

    const result = await query(
        `
        SELECT
            A.username,
            A."accessId" AS "roleId",
            A.fullname,
            A.status,
            CASE
                WHEN A.status = 0 THEN 'inactive'
                WHEN A.status = 1 THEN 'active'
                ELSE 'unknown'
            END AS "status_text"
        FROM user_mobile A
        ${whereCondition};
        `,
        params
    );

    return result.rows[0] as Users;
}

export async function insertUser({
    newUsers,
    userId,
}: {
    newUsers: Users & { roleId: number; password: string };
    userId: number;
}) {
    return await withTransaction(async (client) => {
        const result = await client.query(
            `INSERT INTO user_mobile (username, fullname, status, password, "accessId", "createdById") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, fullname, "accessId", status`,
            [newUsers.username, newUsers.fullname, newUsers.status, newUsers.password, newUsers.roleId, userId]
        );
        return result.rows[0] as Users;
    });
}

export async function UpdateUser({
    users,
    userId,
}: {
    users: Users & { roleId: number; oldPassword: string; password: string };
    userId: number;
}) {
    return await withTransaction(async (client) => {
        let queryStr = '';
        let params: unknown[] = [];
        if (users.oldPassword) {
            // Update password
            queryStr = `UPDATE user_mobile SET username = $1, fullname = $2, status = $3, password = $4, "accessId" = $5, updated_at = NOW(), "updatedById" = $6 WHERE id = $7 RETURNING id, username, fullname, "accessId", status`;
            params = [users.username, users.fullname, users.status, users.password, users.roleId, userId, users.id];
        } else {
            // Do not update password
            queryStr = `UPDATE user_mobile SET username = $1, fullname = $2, status = $3, "accessId" = $4, updated_at = NOW(),  "updatedById" = $5 WHERE id = $6 RETURNING id, username, fullname, "accessId", status`;
            params = [users.username, users.fullname, users.status, users.roleId, userId, users.id];
        }
        const result = await client.query(queryStr, params);
        return result.rows[0] as Users;
    });
}
