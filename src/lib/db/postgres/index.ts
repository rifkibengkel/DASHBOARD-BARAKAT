import { Pool, PoolClient } from 'pg';

let pool: Pool;

declare global {
    var pgPool: Pool | undefined;
}

export const getPool = (): Pool => {
    if (!global.pgPool) {
        global.pgPool = new Pool({
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT) || 5432,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASS,
            database: process.env.POSTGRES_NAME,
            max: 15,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }
    pool = global.pgPool;
    return pool;
};

export const query = async (text: string, params?: unknown[]) => {
    const pool = getPool();
    const client = await pool.connect();

    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
};

export const withTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
