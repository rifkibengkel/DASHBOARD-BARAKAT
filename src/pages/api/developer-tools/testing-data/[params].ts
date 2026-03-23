import { getLoginSession } from "@/lib/auth/session";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { Filter, PaginatedResponse, Pagination, UsersList } from "@/types";
import { NextApiRequest, NextApiResponse } from "next";
import {
  deleteTestingData,
  getTesterData,
  getTesterDataDetail,
  getTestingData,
  getUserOption,
  insertTestingData,
  updateTestingData,
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
        await getTestingData({
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

    if (req.query.params === "userOption") {
      const data = await getUserOption();
      return res.status(200).json({ data: data });
    }

    if (req.query.params === "detail") {
      const { id } = req.query;
      const resultCore = await getTesterData(parseInt(id as string));
      const resultDetail = await getTesterDataDetail(parseInt(id as string));

      const data = {
        ...resultCore,
        list: resultDetail,
      };

      return res.status(200).json({ data });
    }
  }

  if (req.method === "POST") {
    if (req.query.params === "create") {
      await insertTestingData({
        userId: session.userId,
        id: parseInt(req.query.id as string),
      });
      return res.status(201).json({ message: "Berhasil menambahkan data" });
    }

    if (req.query.params === "update") {
      await updateTestingData({
        userId: session.userId,
        id: parseInt(req.query.id as string),
      });
      return res.status(200).json({ message: "Berhasil mengubah data" });
    }

    if (req.query.params === "delete") {
      const { id } = req.query;
      await deleteTestingData({
        userId: parseInt(id as string),
      });
      return res.status(200).json({ message: "Berhasil menghapus data" });
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
