import { useNotificationStore } from "@/stores/useNotification";
import { useRouter } from "next/navigation";
import { WinnerDetail } from "@/types";
import dayjs from "dayjs";
import { winnerApprove } from "@/components/pages/Winner/Winner.schema";
import useCustomFormik from "@/hooks/useCustomFormik";

interface WinnerDetailData {
  winner: WinnerDetail;
  winnerImage: any[];
}

interface UseWinnerDetailFormikProps {
  winnerData: WinnerDetailData;
}

export function useWinnerDetailFormik({
  winnerData,
}: UseWinnerDetailFormikProps) {
  const router = useRouter(); // Gunakan useRouter di dalam hook
  const { notify } = useNotificationStore();

  return useCustomFormik({
    initialValues: {
      fullname: winnerData?.winner?.fullname || "",
      coupon: winnerData?.winner?.coupon || "",
      sender: winnerData?.winner?.sender || "",
      store: winnerData?.winner?.store || "",
      id_number: winnerData?.winner?.id_number || "",
      regency: winnerData?.winner?.regency || "",
      media: winnerData?.winner?.media || "",
      prize: winnerData?.winner?.prize || "",
      voucher: winnerData.winner.voucher || "",
      rcvd_time: winnerData?.winner?.rcvd_time
        ? dayjs(winnerData.winner.rcvd_time)
        : null,
      ktp_name_admin: winnerData.winner.ktp_name_admin || "",
      id_number_admin: winnerData.winner.id_number_admin || "",
      invalid_reason_id: winnerData.winner.invalid_reason_id,
      image_labels: null,
      prevApprovedWinnerId: null,
    },
    validationSchema: winnerApprove,
    onSubmit: async (values) => {
      try {
        const payload = {
          ktp_name_admin: values.ktp_name_admin,
          id_number_admin: values.id_number_admin,
          image_labels: values.image_labels,
          prevApprovedWinnerId: values.prevApprovedWinnerId,
        };

        const response = await fetch(
          `/api/winner/approve?id=${winnerData.winner.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const response_data = await response.json();

        if (!response.ok) {
          throw new Error(response_data.message);
        }

        notify({
          message: "Winner approved successfully",
          type: "success",
        });

        router.back();
      } catch (error) {
        console.error("Error validating Winner:", error);
        if (error instanceof Error) {
          notify({
            message: error.message || "Failed to approve Winner",
            type: "error",
          });
        } else {
          notify({
            message: "Failed to approve Winner",
            type: "error",
          });
        }
      }
    },
  });
}
