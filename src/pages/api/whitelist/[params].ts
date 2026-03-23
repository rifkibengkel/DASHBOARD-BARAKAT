import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import { Filter, PaginatedResponse, Pagination, UsersList } from "@/types";
import {
  deleteWhiteList,
  getWhiteList,
  getWhiteListById,
  insertWhiteList,
  updateWhiteList,
} from "./_model";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getLoginSession(req);
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.method === "GET") {
    if (req.query.params === "list") {
      const { key, column, direction, page, limit } = req.query as Filter &
        Pagination;
      const { list, currentPage, dataPerPage, totalData, totalPage } =
        await getWhiteList({
          key,
          column,
          direction,
          page,
          limit,
        });
      return res.status(200).json({
        list,
        currentPage,
        dataPerPage,
        totalData,
        totalPage,
      } as PaginatedResponse<UsersList>);
    }

    if (req.query.params === "detail") {
      const { id } = req.query;
      const data = await getWhiteListById(parseInt(id as string));
      return res.status(200).json({ data: data });
    }
  }

  if (req.method === "POST") {
    if (req.query.params === "create") {
      await insertWhiteList({ userId: session.userId, whitelist: req.body });
      return res.status(201).json({ message: "Berhasil menambahkan data" });
    }

    if (req.query.params === "update") {
      const { id } = req.query;
      await updateWhiteList({
        userId: session.userId,
        whitelist: req.body,
        id: parseInt(id as string),
      });
      return res.status(200).json({ message: "Berhasil mengubah data" });
    }

    if (req.query.params === "delete") {
      const { id } = req.query;
      await deleteWhiteList({
        id: parseInt(id as string),
        userId: session.userId,
      });
      return res.status(200).json({ message: "Berhasil menghapus data" });
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
