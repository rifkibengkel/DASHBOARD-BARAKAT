import { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';
import { JWT_SECRET_NAME } from '@/lib/common/constant';

if (!JWT_SECRET_NAME) {
    throw new Error('TOKEN_NAME is not defined');
}

export const setTokenCookie = (res: NextApiResponse, token: string) => {
    const cookie = serialize(JWT_SECRET_NAME as string, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    });

    res.setHeader('Set-Cookie', cookie);
};

export const removeTokenCookie: (res: NextApiResponse) => void = (res: NextApiResponse) => {
    const cookie = serialize(JWT_SECRET_NAME as string, '', {
        maxAge: -1,
        path: '/',
    });

    res.setHeader('Set-Cookie', cookie);
};

export const parseCookies = (req: NextApiRequest) => {
    if (req.cookies) return req.cookies;

    const cookie = req.headers?.cookie;
    return parse(cookie || '');
};

export const getTokenCookie = (req: NextApiRequest) => {
    const cookies = parseCookies(req);
    return cookies[JWT_SECRET_NAME as string];
};
