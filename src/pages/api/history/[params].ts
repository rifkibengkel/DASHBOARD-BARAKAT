import { NextApiRequest, NextApiResponse } from 'next';
import { getLoginSession } from '@/lib/auth/session';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getUserHistory } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'user') {
            const { id } = req.query;

            const data = await getUserHistory(id as string);
            return res.status(200).json({ data });
        }
    }
    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
