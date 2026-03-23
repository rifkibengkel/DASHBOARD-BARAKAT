import { query } from '@/lib/db/postgres';
import { QueryResult } from 'pg';

export async function getKTPDetail(districtCode: string) {
    const result: QueryResult = await query(
        `
        SELECT
        p.name as "province",
        c.name as "city",
        d.name as "district"
        FROM
        province p
        LEFT JOIN city c on c."provinceId" = p.id
        LEFT JOIN district d on d."cityId" = c.id
        WHERE d.code = $1
        `,
        [districtCode]
    );

    return result.rows[0] as { province: string; city: string; district: string };
}
