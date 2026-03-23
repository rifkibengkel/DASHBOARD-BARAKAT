import { NextApiRequest, NextApiResponse } from "next";
import { ApiError, withErrorHandler } from "@/lib/common/api";
import { getLoginSession } from "@/lib/auth/session";
import {
  getAgeDemographic,
  getDistribution,
  getGenderDemographic,
  getStoreDemographic,
  getStoreDemographicByDateWithUsers,
} from "./_model";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getLoginSession(req);
  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.method === "GET") {
    if (req.query.params === "list") {
      const store = await getStoreDemographic();
      const age = await getAgeDemographic();
      const gender = await getGenderDemographic();
      const ktp = await getDistribution();
      const demo = await getStoreDemographicByDateWithUsers();

      return res.status(200).json({
        demo,
        store,
        age,
        gender,
        ktp,
      });
    }
  }

  throw new ApiError(405, "Method Not Allowed");
}

export default withErrorHandler(handler);
