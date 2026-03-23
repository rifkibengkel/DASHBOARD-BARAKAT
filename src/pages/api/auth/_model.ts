import { QueryResult } from 'pg';
import { query } from '@/lib/db/postgres';

export default async function getUser(username: string) {
    const users: QueryResult = await query(
        `
            SELECT 
                A.id, 
                A.username, 
                A.password, 
                A."accessId", 
                A.fullname, 
                B.description AS role
            FROM user_mobile A
            INNER JOIN access B ON A."accessId" = B.id
            WHERE A.username = $1
        `,
        [username]
    );

    return users.rows?.[0];
}
