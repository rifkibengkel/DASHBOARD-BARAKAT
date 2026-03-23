import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import {
  getInvalidReason,
  getMasterParameterByName,
  getMenu,
  getProduct,
  getPromo,
} from "./_model";
import { createHttpClient } from "@/lib/common/httpClient";

export async function getInvalidReasonList() {
  const invalidReason = getInvalidReason();
  return invalidReason;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getLoginSession(req);
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.method === "GET") {
    if (req.query.params === "menu") {
      const menu = await getMenu(session.username);
      const promo = await getPromo();
      return res.status(200).json({ menu, promo, session });
    }

    if (req.query.params === "product") {
      const product = await getProduct();
      return res.status(200).json({ product });
    }

    if (req.query.params === "district") {
      const { key } = req.query;
      if (!key || typeof key !== "string") {
        return res.status(400).json({ message: "Invalid district search key" });
      }

      const urlSAP = await getMasterParameterByName("urlSAP");
      const tokenSAP = await getMasterParameterByName("tokenSAP");

      const sapClient = createHttpClient({
        baseURL: urlSAP.value,
        token: `${tokenSAP.value}`,
      });

      try {
        const data = await sapClient.get(
          `/api/auth/search-district/${encodeURIComponent(key)}`,
        );
        const mapped = data.data.map((item: any, index: number) => {
          // Format label yang seragam: "DISTRICT_NAME(CITY_NAME)-DISTRICT_CODE"
          let formattedLabel = "";

          if (
            item.district_name &&
            item.district_name.includes("(") &&
            item.district_name.includes(")")
          ) {
            // Jika district_name sudah mengandung format yang diinginkan, gunakan langsung
            formattedLabel = item.district_name;
          } else {
            // Jika belum, format menjadi: "DISTRICT_NAME(CITY_NAME)-DISTRICT_CODE"
            const districtName = item.district_name || "";
            const cityName = item.city_name || "";
            const districtCode = item.district_code || "";

            if (districtCode) {
              formattedLabel = `${districtName}(${cityName})-${districtCode}`;
            } else {
              formattedLabel = `${districtName}(${cityName})`;
            }
          }

          return {
            key: (index + 1).toString(),
            id: item.id,
            name: formattedLabel,
            city_name: item.city_name,
            province_name: item.provinsi_name,
          };
        });

        return res.status(200).json({ data: mapped });
      } catch (error: unknown) {
        const status = 500;
        let message = "Internal Server Error";
        console.error("Fetch error:", error);

        if (error instanceof Error) {
          message = error.message;
        }

        return res.status(status).json({ message: message });
      }
    }

    if (req.query.params === "prize") {
      const urlSAP = await getMasterParameterByName("urlSAP");
      const tokenSAP = await getMasterParameterByName("tokenSAP");
      const programId = await getMasterParameterByName("programId");

      const sapClient = createHttpClient({
        baseURL: urlSAP.value,
        token: `${tokenSAP.value}`,
      });

      try {
        const data = await sapClient.get(
          `/api/auth/master-prize/all/${programId.value}`,
        );

        return res
          .status(200)
          .json({ data: data.data.data, programId: programId.value });
      } catch (error: unknown) {
        const status = 500;
        let message = "Internal Server Error";
        console.error("Fetch error:", error);

        if (error instanceof Error) {
          message = error.message;
        }

        return res.status(status).json({ message: message });
      }
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
