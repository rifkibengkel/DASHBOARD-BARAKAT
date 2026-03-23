import type { NextApiRequest, NextApiResponse } from 'next';
import * as bcrypt from 'bcrypt';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { setLoginSession } from '@/lib/auth/session';
import getUser from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        throw new ApiError(405, 'Method Not Allowed');
    }

    const { username, password } = req.body;
    if (!username || !password) {
        throw new ApiError(400, 'Username dan Password diperlukan');
    }

    const users: {
        id: number;
        username: string;
        password: string;
        fullname: string;
        role: string;
        accessId: number;
    } = await getUser(username);

    if (!users) {
        throw new ApiError(400, 'Username atau Password salah');
    }

    const passwordValid = await bcrypt.compare(password, users.password);
    if (!passwordValid) {
        throw new ApiError(400, 'Username atau Password salah');
    }

    await setLoginSession(res, {
        userId: users.id,
        username: users.username,
        name: users.fullname,
        role: users.role,
        accessId: users.accessId,
    });

    return res.status(200).json({ message: 'Login Berhasil' });
}

export default withErrorHandler(handler);
