import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { getEntryStatistic, getEntrySummary } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'list') {
            const { type } = req.query;
            const statistic = await getEntryStatistic({
                type: type as string as 'daily' | 'weekly' | 'monthly',
                include_out_period: true,
            });
            const summary = await getEntrySummary({
                type: type as string as 'daily' | 'weekly' | 'monthly',
                include_out_period: true,
            });
            return res.status(200).json({
                statistic,
                summary,
            });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
