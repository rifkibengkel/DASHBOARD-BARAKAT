import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import { Allocation, Filter, PaginatedResponse, Pagination } from "@/types";
import { getAllocation, insertAllocation } from "./_model";

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
        await getAllocation({
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
      } as PaginatedResponse<Allocation>);
    }
  }

  if (req.method === "POST") {
    if (req.query.params === "create") {
      const { allocation_date, prizeId, quantity, regionId, storeId } =
        req.body;
      if (!allocation_date || !prizeId || !quantity) {
        return res.status(400).json({ message: "Bad Request" });
      }

      await insertAllocation({
        allocation_date,
        prizeId,
        quantity,
        regionId,
        storeId,
      });
      return res
        .status(201)
        .json({ message: "Allocation successfully inserted" });
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
