import { PayloadSAP } from "@/types";
import { getMasterParameterByName } from "../master/_model";
import { createHttpClient } from "@/lib/common/httpClient";
import axios from "axios";

export const hitApiIntegration = async ({
  winner_id,
  invalid_id,
}: {
  invalid_id: number | null;
  winner_id: number;
  user_id: number;
}) => {
  try {
    let urlIntegration;
    if (invalid_id) {
      urlIntegration = await getMasterParameterByName("winnerReject");
    } else {
      urlIntegration = await getMasterParameterByName("winnerApprove");
    }

    if (!urlIntegration?.value) {
      const type = invalid_id ? "winnerReject" : "winnerApprove";
      console.warn(`${type} not configured.`);
      return;
    }

    const integrationClient = createHttpClient({
      baseURL: urlIntegration.value,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = {
      winner_id,
      ...(invalid_id ? { invalid_reason_id: invalid_id } : {}),
    };

    await integrationClient.post("", payload);

    return {
      isSuccess: true,
      code: 201,
      message: "Success",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Webhook request failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        payload: { winner_id, invalid_id },
      });
    } else {
      console.error("Unexpected error in webhook:", {
        message: error,
        payload: { winner_id, invalid_id },
      });
    }

    return {
      isSuccess: false,
      code: 500,
      message: "Ada Masalah Dengan API. Hubungi Developer",
    };
  }
};

export const hitApiTopup = async ({
  winnerId,
  user_id,
}: {
  winnerId: number;
  user_id: number;
}) => {
  try {
    const apiTopup = await getMasterParameterByName("topupUrl");
    const brandId = await getMasterParameterByName("topupBrand");

    if (!apiTopup?.value) {
      console.warn(`topupUrl not configured.`);
      return;
    }

    const topupClient = createHttpClient({
      baseURL: apiTopup.value,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    const payload = {
      brandId: brandId.value,
      winnerId: winnerId,
      userId: user_id,
    };

    await topupClient.post(apiTopup.value, payload);
    return true;
  } catch (error) {
    console.error("Failed to notify webhook. reason: ", error);
    return false;
  }
};

export const hitJotForm = async ({ payload }: { payload: PayloadSAP }) => {
  try {
    const urlSAP = await getMasterParameterByName("urlSAP");
    const tokenSAP = await getMasterParameterByName("tokenSAP");

    const sapClient = createHttpClient({
      baseURL: urlSAP.value,
      token: `${tokenSAP.value}`,
    });

    const res = await sapClient.post(
      `${urlSAP.value}/api/auth/pickup-send`,
      payload
    );
    if (res.data.statusCode >= 400) {
      throw Error(res.data.data);
    }
    return true;
  } catch (error) {
    console.error("Failed to notify webhook. reason: ", error);
    return false;
  }
};
