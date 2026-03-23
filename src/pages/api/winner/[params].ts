import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import {
  Filter,
  PaginatedResponse,
  Pagination,
  PayloadSAP,
  Winner,
} from "@/types";
import {
  getWinnerList,
  getWinnerById,
  getWinnerImage,
  approveWinner,
  setShipmentDelivered,
  setShipmentReceived,
  exportWinner,
  rejectWinner,
  getWinnerHistory,
  getWinnerTransactionHistory,
  changeWinnerAccount,
  addWinnerAttachment,
  getGeneralParameter,
  deleteWinnerAttachment,
  setShipment,
  updateWinnerImageLabels,
} from "./_model";
import { hitApiIntegration, hitApiTopup, hitJotForm } from "./_helper";
import {
  generateColumnsFromData,
  generateExcelBuffer,
  generateExcelFilename,
} from "@/lib/utils/excel";
import { customFilename, validateUploadS3 } from "@/lib/utils";

export async function getWinnerDetail(id: string | number) {
  const winner = await getWinnerById(id);
  const winnerImage = await getWinnerImage(id);
  return {
    winner,
    winnerImage,
  };
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
        type,
        prizeId,
        startDate,
        endDate,
        status,
        isApproved,
        column,
        direction,
        page,
        limit,
      } = req.query as Filter & Pagination;

      const { list, currentPage, dataPerPage, totalData, totalPage } =
        await getWinnerList({
          key,
          prize: String(type),
          prizeId,
          startDate,
          endDate,
          status,
          isApproved,
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
      } as unknown as PaginatedResponse<Winner>);
    }

    if (req.query.params === "history") {
      const { id } = req.query;
      const resultCore = await getWinnerHistory(id as string);
      const resultDetail = await getWinnerTransactionHistory(id as string);

      const data = {
        ...resultCore,
        list: resultDetail,
      };

      return res.status(200).json({ data });
    }

    if (req.query.params === "detail") {
      const { id } = req.query;
      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Winner ID is required");
      }
      const data = await getWinnerDetail(id);
      return res.status(200).json(data);
    }

    if (req.query.params === "images") {
      const { id } = req.query;
      const resultCore = (await getWinnerImage(id as string)) || [];

      const mappedData = resultCore.map((item, index) => ({
        id: index + 1,
        url: item.src,
        name: `Gambar ${index + 1}`,
      }));

      return res.status(200).json({ data: mappedData });
    }

    if (req.query.params === "export") {
      const { type, key, startDate, endDate, status, isApproved, prizeId } =
        req.query;

      const exportParams = {
        key: key ? (key as string) : "",
        startDate: startDate ? (startDate as string) : "",
        endDate: endDate ? (endDate as string) : "",
        prizeId: prizeId ? Number(prizeId as string) : undefined,
        status: status ? Number(status as string) : undefined,
        isApproved: isApproved ? Number(isApproved as string) : undefined,
        type: type ? (type as string) : "",
      };

      const result = await exportWinner(exportParams);
      const columns = generateColumnsFromData(result || []);
      const excelBuffer = await generateExcelBuffer(
        result || [],
        columns,
        `Entries ${type || "data"}`,
      );
      const filename = generateExcelFilename(`winner_${type || "data"}`, {
        startDate,
        endDate,
        key,
        status,
        isApproved,
        prizeId,
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Length", excelBuffer.length);

      return res.status(200).send(Buffer.from(excelBuffer));
    }
  }

  if (req.method === "POST") {
    if (req.query.params === "reject") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Entry not found");
      }

      if (!winner.allocation_id) {
        throw new ApiError(404, "Alocation Not Found, Call Developer");
      }

      const { invalid_id } = req.body;

      const apiExtResult = await hitApiIntegration({
        winner_id: winner.id,
        invalid_id: invalid_id,
        user_id: session.userId,
      });

      if (apiExtResult?.isSuccess) {
        await rejectWinner({
          id: winner.id,
          user_id: session.userId,
          allocation_id: winner.allocation_id,
          invalid_id: invalid_id as string,
        });
      } else {
        return res
          .status(apiExtResult?.code ?? 500)
          .json({ message: apiExtResult?.message ?? "Terjadi Kesalahan" });
      }

      return res.status(200).json({
        status: 200,
        message: "Entry rejected successfully",
        id,
      });
    }

    if (req.query.params === "approve") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Winner ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Winner not found");
      }

      const {
        ktp_name_admin,
        id_number_admin,
        image_labels,
        prevApprovedWinnerId,
      } = req.body;

      const apiExtResult = await hitApiIntegration({
        winner_id: winner.id,
        invalid_id: null,
        user_id: session.userId,
      });

      if (apiExtResult?.isSuccess) {
        if (!prevApprovedWinnerId) {
          await updateWinnerImageLabels({
            id,
            user_id: session.userId,
            image_labels,
          });
        }
        await approveWinner({
          id,
          user_id: session.userId,
          id_number_admin,
          ktp_name_admin,
        });
      } else {
        return res
          .status(apiExtResult?.code ?? 500)
          .json({ message: apiExtResult?.message ?? "Terjadi Kesalahan" });
      }

      return res.status(201).json({ message: "Winner approved successfully" });
    }

    if (req.query.params === "image") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        return res.status(400).json({ message: "Winner ID is required" });
      }

      const { image, sender } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({ message: "Image base64 is required" });
      }

      if (!sender || typeof sender !== "string") {
        return res.status(400).json({ message: "Sender is required" });
      }

      try {
        const urlPath = await getGeneralParameter("imgUrl");
        const key = `${customFilename(sender)}(admin${session.userId}).jpeg`;
        const uploaded = await validateUploadS3(key, image);

        await addWinnerAttachment({
          id,
          user_id: session.userId,
          url: `${urlPath}/${key}`,
        });

        return res.status(200).json({
          message: "Upload success",
          data: uploaded,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed", error });
      }
    }

    if (req.query.params === "shipment") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Entry not found");
      }

      const submitSAP = await hitJotForm({
        payload: req.body as PayloadSAP,
      });
      if (!submitSAP) {
        return res.status(400).json({ message: "Bad Request SAP" });
      }

      const submitData = await setShipment({
        id,
        user_id: session.userId,
      });

      if (!submitData) {
        return res.status(400).json({ message: "Failed to approved winner" });
      }

      return res.status(201).json({ message: "Set Shipment Success" });
    }

    if (req.query.params === "delivered") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Entry not found");
      }

      await setShipmentDelivered({ id: winner.id, user_id: session.userId });
      return res.status(201).json({ message: "Winner approved successfully" });
    }

    if (req.query.params === "received") {
      const { id } = req.query;

      if (!id || typeof id !== "string") {
        throw new ApiError(400, "Entry ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Entry not found");
      }

      await setShipmentReceived({ id: winner.id, user_id: session.userId });
      return res.status(201).json({ message: "Winner approved successfully" });
    }

    if (req.query.params === "retopup") {
      const { id, hp } = req.body;

      if (!id || (typeof id !== "string" && typeof id !== "number")) {
        throw new ApiError(400, "Winner ID is required");
      }

      const winner = await getWinnerById(id);
      if (!winner) {
        throw new ApiError(404, "Winner not found");
      }

      const changeHP = winner.sender != hp;

      if (changeHP) {
        await changeWinnerAccount({
          winner_id: winner.id,
          hp,
          user_id: session.userId,
        });
      }

      await hitApiTopup({ winnerId: winner.id, user_id: session.userId });
      return res.status(200).json({ message: "ok" });
    }
  }

  if (req.method === "DELETE") {
    if (req.query.params === "image") {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ message: "Url is required" });
      }

      try {
        const result = await deleteWinnerAttachment({
          user_id: session.userId,
          url,
        });
        return res.status(200).json({
          message: "Delete success",
          data: result,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed", error });
      }
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
