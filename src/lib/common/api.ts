import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export function withErrorHandler(handler: NextApiHandler): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            return await handler(req, res);
        } catch (error: unknown) {
            console.error('API Error:', error);

            if (error instanceof ApiError) {
                if (error.statusCode === 401) {
                    res.writeHead(302, { Location: '/api/logout' });
                    res.end();
                    return;
                }

                return res.status(error.statusCode).json({ message: error.message });
            }

            return res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}

export const apiSWR = (url: string) => fetch(url).then((res) => res.json());
