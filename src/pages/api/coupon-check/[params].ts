import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { getCouponByName } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'detail') {
            const { key } = req.query;

            const result = await getCouponByName({ coupon: key as string });
            return res.status(200).json({ data: result });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
