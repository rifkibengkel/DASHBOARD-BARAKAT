import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { getEntryStatistic, getUserDemographic, getUserEntries, getUserRegistered, getUserStatistic } from './_model';
import { getGeneralParameter } from '../winner/_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'users') {
            const userRegistered = await getUserRegistered();
            const userEntries = await getUserEntries();
            const isEnableDetailStats = await getGeneralParameter("isEnableDetailStats");
            return res.status(200).json({ users: userRegistered, entries: userEntries, isEnableDetailStats });
        }

        if (req.query.params === 'demographics') {
            const userDemographic = await getUserDemographic();
            return res.status(200).json({ ...userDemographic });
        }

        if (req.query.params === 'entries-statistic') {
            const { type } = req.query;

            const entriesStatistic = await getEntryStatistic({
                type: type as 'daily' | 'weekly' | 'monthly',
                include_out_period: true,
            });

            return res.status(200).json({ type: type, ...entriesStatistic });
        }

        if (req.query.params === 'users-statistic') {
            const { type } = req.query;

            const userStatistic = await getUserStatistic({
                type: type as 'daily' | 'weekly' | 'monthly',
                include_out_period: true,
            });

            return res.status(200).json({ type: type, ...userStatistic });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
