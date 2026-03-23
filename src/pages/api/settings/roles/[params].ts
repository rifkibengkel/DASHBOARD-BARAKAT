import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError, withErrorHandler } from '@/lib/common/api';
import { getLoginSession } from '@/lib/auth/session';
import { Filter, PaginatedResponse, Pagination, Roles } from '@/types';
import { getRolesById, getRolesList, insertRole, updateRole, updateRoleMenu } from './_model';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getLoginSession(req);
    if (!session) {
        throw new ApiError(401, 'Unauthorized');
    }

    if (req.method === 'GET') {
        if (req.query.params === 'list') {
            const { key, column, direction, page, limit } = req.query as Filter & Pagination;
            const { list, currentPage, dataPerPage, totalData, totalPage } = await getRolesList({
                key,
                column,
                direction,
                page,
                limit,
            });
            return res
                .status(200)
                .json({ list, currentPage, dataPerPage, totalData, totalPage } as PaginatedResponse<Roles>);
        }

        if (req.query.params === 'detail') {
            const { id } = req.query;
            const roles = await getRolesById(parseInt(id as string));
            return res.status(200).json({ data: roles });
        }
    }

    if (req.method === 'POST') {
        if (req.query.params === 'create') {
            const { role, status, menu } = req.body;
            const roles = await insertRole({ userId: session.userId, role, status });
            await updateRoleMenu({ userId: session.userId, roleId: roles.id!, menus: menu });
            return res.status(201).json({ message: 'Berhasil menambahkan data' });
        }

        if (req.query.params === 'update') {
            const { id } = req.query;
            const { role, status, menu } = req.body;
            await updateRole({ id: parseInt(id as string), userId: session.userId, role, status });
            await updateRoleMenu({ userId: session.userId, roleId: parseInt(id as string), menus: menu });
            return res.status(200).json({ message: 'Berhasil mengubah data' });
        }
    }

    throw new ApiError(405, 'Method Not Allowed');
}

export default withErrorHandler(handler);
