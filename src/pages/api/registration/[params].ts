import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import {
  RegistrationData,
  Filter,
  PaginatedResponse,
  Pagination,
} from "@/types";
import { exportRegistration, getRegistrationData } from "./_model";
import {
  generateColumnsFromData,
  generateExcelBuffer,
  generateExcelFilename,
} from "@/lib/utils/excel";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getLoginSession(req);
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.method === "GET") {
    if (req.query.params === "list") {
      const { key, column, direction, page, limit, startDate, endDate } =
        req.query as Filter & Pagination;
      const { list, currentPage, dataPerPage, totalData, totalPage } =
        await getRegistrationData({
          key,
          startDate,
          endDate,
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
      } as PaginatedResponse<RegistrationData>);
    }

    if (req.query.params === "export") {
      const { key, startDate, endDate } = req.query as Filter;
      const result = await exportRegistration({ key, startDate, endDate });

      const columns = generateColumnsFromData(result || []);

      const excelBuffer = await generateExcelBuffer(
        result || [],
        columns,
        `Registration data`
      );
      const filename = generateExcelFilename("registration");

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", excelBuffer.length);

      return res.status(200).send(Buffer.from(excelBuffer));
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
