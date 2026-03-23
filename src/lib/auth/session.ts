import type { NextApiResponse, NextApiRequest } from 'next';
import Iron from '@hapi/iron';
import { JWT_SECRET_KEY, JWT_EXPIRES } from '@/lib/common/constant';
import { setTokenCookie, getTokenCookie, removeTokenCookie } from './cookies';
import { Session } from '@/types';

if (!JWT_SECRET_KEY) {
    throw new Error('TOKEN_SECRET is not defined');
}

export const setLoginSession = async (res: NextApiResponse, session: Session) => {
    const createdAt = Date.now();
    const obj = { session, createdAt, maxAge: +JWT_EXPIRES };

    const token = await Iron.seal(obj, JWT_SECRET_KEY, Iron.defaults);

    setTokenCookie(res, token);
};

export const getLoginSession = async (req: NextApiRequest): Promise<Session | null> => {
    const token = getTokenCookie(req);
    if (!token) return null;

    try {
        const { session, createdAt, maxAge } = await Iron.unseal(token, JWT_SECRET_KEY, Iron.defaults);

        if (Date.now() - createdAt > maxAge * 1000) {
            return null;
        }

        return session as Session;
    } catch (err) {
        console.error('Failed to unseal session:', err);
        return null;
    }
};

export const clearLoginSession = (res: NextApiResponse) => {
    removeTokenCookie(res);
};
