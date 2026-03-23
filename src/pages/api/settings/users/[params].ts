import * as bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { Filter, PaginatedResponse, Pagination, Users } from '@/types';
import { getUserById, getUsersList, insertUser, UpdateUser } from './_model';
import getUser from '../../auth/_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'list') {
            const { key, column, direction, page, limit } = req.query as Filter & Pagination;
            const { list, currentPage, dataPerPage, totalData, totalPage } = await getUsersList({
                key,
                column,
                direction,
                page,
                limit,
            });
            return res
                .status(200)
                .json({ list, currentPage, dataPerPage, totalData, totalPage } as PaginatedResponse<Users>);
        }

        if (req.query.params === 'detail') {
            const { id } = req.query;
            const data = await getUserById(parseInt(id as string));
            return res.status(200).json({ data: data });
        }
    }

    if (req.method === 'POST') {
        if (req.query.params === 'create') {
            const body = req.body;

            body.password = await bcrypt.hash(body.password, 10);
            await insertUser({ newUsers: body, userId: session.userId });
            return res.status(201).json({ message: 'Berhasil menambahkan data' });
        }

        if (req.query.params === 'update') {
            const { id } = req.query;
            const body = req.body;

            body.id = id;
            if (body.oldPassword && body.password) {
                const users = await getUser(body.username);
                if (!users) {
                    throw new ApiError(400, 'Password lama salah');
                }

                const passwordValid = await bcrypt.compare(body.oldPassword, users.password);
                if (!passwordValid) {
                    throw new ApiError(400, 'Password lama salah');
                }
                body.password = await bcrypt.hash(body.password, 10);
            }

            await UpdateUser({ users: body, userId: session.userId });
            return res.status(200).json({ message: 'Berhasil mengubah data' });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
