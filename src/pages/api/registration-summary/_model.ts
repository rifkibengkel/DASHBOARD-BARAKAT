import { QueryResult } from 'pg';
import { query } from '@/lib/db/postgres';
import { getPromo } from '../master/_model';
import dayjs from 'dayjs';

export async function getUserStatistic({
    type,
    include_out_period,
}: {
    type: 'daily' | 'weekly' | 'monthly';
    include_out_period: boolean;
}) {
    const period = await getPromo();
    if (!period) throw new Error('Promo period not found');

    const dateTruncUnit = type === 'weekly' ? 'week' : type === 'monthly' ? 'month' : 'day';
    const step = type === 'weekly' ? '1 week' : type === 'monthly' ? '1 month' : '1 day';

    const promoStart = dayjs(period.periode_start).format('YYYY-MM-DD HH:mm:ss');
    const promoEnd = dayjs().isBefore(period.periode_end)
        ? dayjs().format('YYYY-MM-DD HH:mm:ss')
        : dayjs(period.periode_end).format('YYYY-MM-DD HH:mm:ss');

    const sql = `
        WITH raw_range AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', MIN(updated_at)) AS min_date,
                DATE_TRUNC('${dateTruncUnit}', MAX(updated_at)) AS max_date
            FROM users
        ),
        data_range AS (
            SELECT
                COALESCE(
                    CASE WHEN ${include_out_period ? 'TRUE' : 'FALSE'}
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
        user_counts AS (
            SELECT
                DATE_TRUNC('${dateTruncUnit}', updated_at) AS period,
                COUNT(*) AS total_users
            FROM users
            GROUP BY period
        )
        SELECT
            ds.period,
            COALESCE(uc.total_users, 0) AS total_users
        FROM date_series ds
        LEFT JOIN user_counts uc ON ds.period = uc.period
        ORDER BY ds.period ASC;
    `;

    const params = [promoStart, promoEnd];
    const result: QueryResult = await query(sql, params);

    const categories: string[] = [];
    const total_users: number[] = [];
    const listData: Array<{ date: string; totalUsers: number }> = [];

    for (const row of result.rows) {
        const period = dayjs(row.period);
        let label: string;
        let dateValue: string;

        if (type === 'weekly') {
            const start = period.startOf('week');
            const end = period.endOf('week');
            label = `${start.locale('id').format('DD MMM YYYY')} - ${end.locale('id').format('DD MMM YYYY')}`;
            dateValue = label;
        } else if (type === 'monthly') {
            label = period.locale('id').format('MMMM YYYY');
            dateValue = period.format('YYYY-MM');
        } else {
            label = period.locale('id').format('DD MMM YYYY');
            dateValue = period.format('YYYY-MM-DD');
        }

        const totalUsersCount = Number(row.total_users || 0);
        categories.push(label);
        total_users.push(totalUsersCount);

        listData.push({
            date: dateValue,
            totalUsers: totalUsersCount,
        });
    }

    const totalTotalUsers = total_users.reduce((sum, count) => sum + count, 0);

    listData.push({
        date: 'Total',
        totalUsers: totalTotalUsers,
    });

    return {
        categories,
        series: [{ name: 'Total Users', data: total_users }],
        list: listData,
    };
}
