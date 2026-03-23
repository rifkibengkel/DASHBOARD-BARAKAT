import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { getPrize } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'list') {
            const prizeList = await getPrize();
            return res.status(200).json({
                prizeList,
            });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
