import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { Menu, Filter, PaginatedResponse, Pagination } from '@/types';
import { getMenuList, getMenuById, insertMenu, updateMenu } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'list') {
            const { key, column, direction } = req.query as Filter & Pagination;
            const { list, currentPage, dataPerPage, totalData, totalPage } = await getMenuList({
                key,
                column,
                direction,
            });
            return res
                .status(200)
                .json({ list, currentPage, dataPerPage, totalData, totalPage } as PaginatedResponse<Menu>);
        }

        if (req.query.params === 'detail') {
            const { id } = req.query;
            const menu = await getMenuById(parseInt(id as string));
            return res.status(200).json({ data: menu });
        }
    }

    if (req.method === 'POST') {
        if (req.query.params === 'create') {
            await insertMenu({ userId: session.userId, menu: req.body });
            return res.status(201).json({ message: 'Berhasil menambahkan data' });
        }

        if (req.query.params === 'update') {
            const { id } = req.query;
            await updateMenu({ id: parseInt(id as string), userId: session.userId, menu: req.body });
            return res.status(200).json({ message: 'Berhasil mengubah data' });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
