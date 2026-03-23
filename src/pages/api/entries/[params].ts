import { NextApiRequest, NextApiResponse } from "next";
import { getLoginSession } from "@/lib/auth/session";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import {
  Filter,
  Pagination,
  PaginatedResponse,
  Entries,
  EntriesDetail,
} from "@/types";
import {
  approveEntries,
  exportEntries,
  exportEntriesByCoupon,
  exportEntriesByProducts,
  getEntriesById,
  getEntriesImages,
  getEntriesList,
  saveEntriesData,
} from "./_model";
import {
  generateColumnsFromData,
  generateExcelBuffer,
  generateExcelFilename,
} from "@/lib/utils/excel";
import { getAllocation, getInvalidReason } from "../master/_model";
// import { checkReceiptDuplicate, checkImageDuplicate } from './_model';
import { hitApiIntegration } from "./_helper";

interface SaveEntries {
  userId: number;
  entries: EntriesDetail;
  // entriesVariant: EntriesDetailVariant[];
}

export async function getEntriesDetail(id: string) {
  const entries = await getEntriesById(id);
  const entriesImage = await getEntriesImages(id);

  return {
    entries,
    entriesImage: entriesImage && entriesImage.length > 0 ? entriesImage : [],
    // entriesVariant: [],
  };
}

export async function checkEntriesData(data: SaveEntries) {
  const { entries } = data;
  // const periode = await getPromo();
  const invalidReasonList = await getInvalidReason();
  // const minimumPurchase = await getMasterParameterById(8);

  try {
    // const totalProduct = entriesVariant.reduce((sum: number, item) => sum + item.quantity, 0);
    // const totalPrice =
    //     entriesVariant && entriesVariant.length > 0
    //         ? entriesVariant.reduce((sum: number, item) => sum + item.total_price, 0)
    //         : 0;

    if (entries.invalid_reason_id) {
      const found = invalidReasonList.find(
        (item) => item.id === entries.invalid_reason_id
      );
      if (found) {
        return {
          invalid: true,
          invalid_id: found.id,
          invalid_reason: found.name,
        };
      }
    }

    // const dateCheckEntries = dateCheck(entries.purchase_date_admin!, periode.periode_start, periode.periode_end);
    // if (!dateCheckEntries) {
    //     const found = invalidReasonList.find((item) => item.id === 41);
    //     if (found) {
    //         return {
    //             invalid: true,
    //             invalid_id: found.id,
    //             invalid_reason: found.name,
    //             invalid_receipt: null,
    //         };
    //     }
    // }

    // const entriesCheckReceipt = await checkReceiptDuplicate({
    //     purchase_no_admin: entries.purchase_no_admin,
    //     entries_id: entries.id,
    // });

    // if (entriesCheckReceipt && entriesCheckReceipt.length > 0) {
    //     const entriesImage = await checkImageDuplicate(entriesCheckReceipt[0].id);
    //     if (entriesImage) {
    //         const found = invalidReasonList.find((item) => item.id === 10);
    //         if (found) {
    //             return {
    //                 invalid: true,
    //                 invalid_id: found.id,
    //                 invalid_reason: found.name,
    //                 invalid_receipt: entriesImage.url,
    //             };
    //         }
    //     }
    // }

    // if (totalPrice < +minimumPurchase.value) {
    //     const found = invalidReasonList.find((item) => item.id === 42);
    //     if (found) {
    //         return {
    //             invalid: true,
    //             invalid_id: found.id,
    //             invalid_reason: found.name,
    //             invalid_receipt: null,
    //         };
    //     }
    // }

    return {
      invalid: false,
      invalid_id: null,
      invalid_reason: null,
      invalid_receipt: null,
    };
  } catch (error) {
    console.error(error);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getLoginSession(req);
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.method === "GET") {
    if (req.query.params === "list") {
      const {
        key,
        startDate,
        endDate,
        isValid,
        isValidAdmin,
        isApprovedAdmin,
        column,
        direction,
        page,
        limit,
        prizeCategoryId,
      } = req.query as Filter & Pagination;

      const { list, currentPage, dataPerPage, totalData, totalPage } =
        await getEntriesList({
          key,
          startDate,
          endDate,
          isValid: isValid ? Number(isValid) : undefined,
          isValidAdmin: isValidAdmin ? Number(isValidAdmin) : undefined,
          isApprovedAdmin: isApprovedAdmin
            ? Number(isApprovedAdmin)
            : undefined,
          prizeCategoryId,
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
      } as PaginatedResponse<Entries>);
    }

    if (req.query.params === "export") {
      let result;
      const {
        type,
        key,
        startDate,
        endDate,
        isValid,
        isValidAdmin,
        isApprovedAdmin,
        prizeCategoryId,
      } = req.query as Filter & Pagination;

      const exportParams = {
        key,
        startDate,
        endDate,
        isValid: isValid ? Number(isValid) : undefined,
        isValidAdmin: isValidAdmin ? Number(isValidAdmin) : undefined,
        isApprovedAdmin: isApprovedAdmin ? Number(isApprovedAdmin) : undefined,
        prizeCategoryId,
      };

      if (type === "coupon") {
        result = await exportEntriesByCoupon(exportParams);
      } else if (type === "product") {
        result = await exportEntriesByProducts(exportParams);
      } else {
        result = await exportEntries(exportParams);
      }

      const columns = generateColumnsFromData(result || []);
      const excelBuffer = await generateExcelBuffer(
        result || [],
        columns,
        `Entries ${type || "data"}`
      );
      const filename = generateExcelFilename(`entries_${type || "data"}`, {
        key,
        startDate,
        endDate,
        isValid: isValid ? Number(isValid) : undefined,
        isValidAdmin: isValidAdmin ? Number(isValidAdmin) : undefined,
        isApprovedAdmin: isApprovedAdmin ? Number(isApprovedAdmin) : undefined,
        prizeCategoryId,
      });

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

  if (req.method === "POST") {
    if (req.query.params === "check") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const { entries } = req.body;
      if (!entries) {
        throw new ApiError(400, "Request data is required");
      }

      const entry = await getEntriesById(id);
      if (!entry) {
        throw new ApiError(404, "Entry not found");
      }

      const response = await checkEntriesData({
        userId: session.userId,
        entries: entries,
        // entriesVariant: entries.variant,
      });

      return res.status(200).json({ ...response });
    }

    if (req.query.params === "validate") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const { entries } = req.body;
      if (!entries) {
        throw new ApiError(400, "Request data is required");
      }

      const entry = await getEntriesById(id);
      if (!entry) {
        throw new ApiError(404, "Entry not found");
      }

      const result = await saveEntriesData({
        userId: session.userId,
        entries: entries,
        // entriesVariant: entries.variant,
      });

      if (result.invalid_id) {
        await hitApiIntegration({
          entry: entries.id,
          invalid_id: result.invalid_id,
          type: "save",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Entry Validate Done",
        id,
      });
    }

    if (req.query.params === "approve") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const entry = await getEntriesById(id);
      if (!entry) {
        throw new ApiError(404, "Entry not found");
      }

      const checkAllocation = await getAllocation();
      if (checkAllocation === 0) {
        throw new ApiError(404, "No Allocation Available");
      }

      const result = await approveEntries({
        entries_id: entry.id,
        invalid_id: null,
        userId: session.userId,
        is_valid: 1,
      });

      if (result) {
        await hitApiIntegration({
          entry: entry.id,
          invalid_id: null,
          type: "approve",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Entry approved successfully",
        id,
      });
    }

    if (req.query.params === "reject") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const entry = await getEntriesById(id);
      if (!entry) {
        throw new ApiError(404, "Entry not found");
      }

      const { invalid_id } = req.body;

      const result = await approveEntries({
        entries_id: entry.id,
        invalid_id: invalid_id,
        userId: session.userId,
        is_valid: 0,
      });

      if (result) {
        await hitApiIntegration({
          entry: entry.id,
          invalid_id: invalid_id,
          type: "approve",
        });
      }

      return res.status(200).json({
        status: 200,
        message: "Entry rejected successfully",
        id,
      });
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
