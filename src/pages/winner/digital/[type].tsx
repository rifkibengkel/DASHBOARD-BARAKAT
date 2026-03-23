import DashboardLayout from "@/components/base/Layout";
import WinnerDetailContent from "@/components/pages/Winner/Components/DetailContent";
import { getLoginSession } from "@/lib/auth/session";
import { getInvalidReasonList } from "@/pages/api/master/[params]";
import { getWinnerDetail } from "@/pages/api/winner/[params]";
import { getPreviousWinnerIdFromUser } from "@/pages/api/winner/_model";
import { WinnerDetailProps } from "@/types";
import { TourProvider } from "@reactour/tour";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import React from "react";

export default function WinnerDetailPage(props: WinnerDetailProps) {
  const { type } = props;

  const tourSteps =
    type === "approve"
      ? [
          {
            selector: '[data-tour="ktp-name-admin"]',
            content:
              "Mohon isi Nama (KTP) dari Admin terlebih dahulu sebelum approve.",
          },
          {
            selector: '[data-tour="id-number-admin"]',
            content:
              "Mohon isi Nomor ID (KTP) dari Admin terlebih dahulu sebelum approve.",
          },
        ]
      : [];

  return (
    <TourProvider
      steps={tourSteps}
      showBadge={true}
      showCloseButton={true}
      showDots={true}
      disableInteraction={false}
      scrollSmooth={true}
      padding={{
        mask: 10,
        popover: [10, 10],
      }}
    >
      <WinnerDetailContent {...props} />
    </TourProvider>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req, query } = context;

  const session = await getLoginSession(req as NextApiRequest);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { id, type } = query;
  const winnerData = await getWinnerDetail(id as string);
  const prevApprovedWinnerId = await getPreviousWinnerIdFromUser(id as string);
  const invalidReasonList = await getInvalidReasonList();

  return {
    props: {
      invalidReasonList,
      winnerData,
      prevApprovedWinnerId,
      type,
    },
  };
}

WinnerDetailPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
