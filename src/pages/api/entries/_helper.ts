import { randomString } from "@/lib/utils";
import { findCouponExist } from "./_model";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getMasterParameterByName } from "../master/_model";
import { createHttpClient } from "@/lib/common/httpClient";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const COUPON_PREFIX = "MCH";
const COUPON_CHARSET = "0123456789QWERTYUIOPASDFGHJKLZXCVBNM";
const COUPON_LENGTH = 5;
const MAX_RETRY_ATTEMPTS = 10;

interface CouponGenerationResult {
  coupons: string[];
  attempts: number;
}

export async function generateUniqueCoupons(
  totalNeeded: number,
): Promise<CouponGenerationResult> {
  const coupons = new Set<string>();
  let attempts = 0;
  const maxAttempts = totalNeeded * MAX_RETRY_ATTEMPTS;

  while (coupons.size < totalNeeded && attempts < maxAttempts) {
    const batchSize = Math.min(10, totalNeeded - coupons.size);
    const candidateCoupons: string[] = [];

    for (let i = 0; i < batchSize; i++) {
      const coupon =
        COUPON_PREFIX + (await randomString(COUPON_LENGTH, COUPON_CHARSET));
      if (!coupons.has(coupon)) {
        candidateCoupons.push(coupon);
      }
    }

    const existenceChecks = await Promise.all(
      candidateCoupons.map(async (coupon) => {
        const exists = await findCouponExist(coupon);
        return { coupon, exists: exists.length > 0 };
      }),
    );

    for (const { coupon, exists } of existenceChecks) {
      if (!exists && coupons.size < totalNeeded) {
        coupons.add(coupon);
      }
    }

    attempts += batchSize;
  }

  if (coupons.size < totalNeeded) {
    throw new Error(
      `Failed to generate ${totalNeeded} unique coupons after ${attempts} attempts`,
    );
  }

  return {
    coupons: Array.from(coupons),
    attempts,
  };
}

export const hitApiIntegration = async ({
  entry,
  invalid_id,
  type,
}: {
  entry: number;
  invalid_id: number | null;
  type: "save" | "approve";
}) => {
  try {
    const shouldTriggerWebhook =
      type === "approve" || (type === "save" && invalid_id);
    if (!shouldTriggerWebhook) {
      console.log("Webhook not triggered - conditions not met");
      return;
    }

    let urlIntegration;
    if (invalid_id) {
      urlIntegration = await getMasterParameterByName("rejectUrl");
    } else {
      urlIntegration = await getMasterParameterByName("approveUrl");
    }

    if (!urlIntegration?.value) {
      const urlType = invalid_id ? "rejectUrl" : "approveUrl";
      console.warn(`${urlType} not configured.`);
      return;
    }

    const payload = {
      entries_id: entry,
      invalidReason: invalid_id,
    };

    const integrationClient = createHttpClient({
      baseURL: urlIntegration.value,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Dashboard-Integration-Service",
      },
      timeout: 10000,
    });

    await integrationClient.post("", payload);
  } catch (error) {
    console.error("Failed to notify webhook. reason: ", error);
  }
};

export const dateCheck = (
  purchaseDate: string,
  startDate: string,
  endDate: string,
): boolean => {
  const purchaseDateObj = dayjs(purchaseDate);
  const startDateObj = dayjs(startDate);
  const endDateObj = dayjs(endDate);

  if (
    purchaseDateObj.isValid() &&
    startDateObj.isValid() &&
    endDateObj.isValid()
  ) {
    if (
      purchaseDateObj.isSameOrAfter(startDateObj) &&
      purchaseDateObj.isSameOrBefore(endDateObj)
    ) {
      return true;
    }
  }

  return false;
};
