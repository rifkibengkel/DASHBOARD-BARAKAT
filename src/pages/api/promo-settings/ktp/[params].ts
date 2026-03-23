import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { KTPCheck } from '@/types';
import dayjs from 'dayjs';
import { getKTPDetail } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'detail') {
            const { key } = req.query;
            const nik = key as string;

            if (!/^\d{16}$/.test(nik)) {
                return res.status(400).json({ error: 'Invalid NIK format. Must be 16 digits.' });
            }

            const districtCode = nik.substring(0, 6);
            let date = parseInt(nik.substring(6, 8), 10);
            const month = parseInt(nik.substring(8, 10), 10);
            const year = parseInt(nik.substring(10, 12), 10);

            const gender: 'M' | 'F' = date > 40 ? 'F' : 'M';
            if (date > 40) date -= 40;

            const currentDate = dayjs();
            const fullYear = year > currentDate.year() % 100 ? 1900 + year : 2000 + year;
            const dateOfBirth = dayjs(`${fullYear}-${month}-${date}`);
            const age = currentDate.diff(dateOfBirth, 'year');

            const detail = await getKTPDetail(districtCode);

            if (detail === undefined || detail === null) {
                return res.status(400).json({ error: 'Invalid NIK format. Must be 16 digits.' });
            }

            return res.status(200).json({
                data: {
                    identity: nik,
                    gender,
                    age,
                    birthdate: dateOfBirth.format('DD/MM/YYYY'),
                    province: detail?.province ?? null,
                    city: detail?.city ?? null,
                    district: detail?.district ?? null,
                } as KTPCheck,
            });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
