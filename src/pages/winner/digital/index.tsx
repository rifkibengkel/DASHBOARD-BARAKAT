import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { APP_NAME } from "@/lib/common/constant";
import { useDashboardStore } from "@/stores/useDashboard";
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import {
  HeaderWinner,
  TableWinner,
} from "@/components/pages/Winner/Components";
import { useSWRWinner } from "@/swr/Winner";
import {
  getApprovedColor,
  getShipmentColor,
  getStatusColor,
} from "@/lib/utils";
import { BaseQueryResult, Filter, Pagination, Winner } from "@/types";
import { getPrize } from "../../api/master/_model";
import { usePageFilter } from "@/hooks/usePageFilter";

const ModalFilter = dynamic(
  () => import("@/components/pages/Winner/Components/ModalFilter")
);
const ModalTransaction = dynamic(
  () => import("@/components/pages/Winner/Components/ModalTransaction")
);

const ModalImage = dynamic(
  () => import("@/components/pages/Winner/Components/ModalImage")
);

export default function DigitalPage({
  prizeList,
}: {
  prizeList: BaseQueryResult[];
}) {
  const { dashboard } = useDashboardStore();
  const getPagination: Pagination = {
    page: 1,
    limit: 10,
  };
  const getFilter: Filter = {
    type: "digital",
    key: "",
    startDate: "",
    endDate: "",
    prizeId: -1,
    status: -1,
    isApproved: -1,
  };

  const { filter, pagination } = usePageFilter(getPagination, getFilter);
  const {
    keys,
    list,
    dataPerPage,
    currentPage,
    totalData,
    totalPage,
    isLoading,
    isError,
  } = useSWRWinner({
    type: "digital",
    filter,
    pagination,
  });

  const listData = list.map((item: Winner, index: number) => ({
    ...item,
    no: (currentPage - 1) * dataPerPage + index + 1,
    status_color: getStatusColor(item.status),
    is_approved_color: getApprovedColor(item.is_approved),
    shipment_status_color: getShipmentColor(item.shipment_status),
  }));

  return (
    <>
      <Head>
        <title>{`Winner - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderWinner
                pageRole={dashboard.currentMenu}
                title={"Digital"}
                prizeList={prizeList}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <TableWinner
                pageRole={dashboard.currentMenu}
                data={{
                  dataPerPage,
                  currentPage,
                  totalData,
                  totalPage,
                  list: listData,
                  key: keys,
                }}
                isLoading={isLoading}
                isError={isError}
                type={1}
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <ModalFilter prizeList={prizeList} />
      <ModalTransaction keys={keys} />
      <ModalImage keys={keys} />
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;
  const session = await getLoginSession(req as NextApiRequest);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const prizeList = await getPrize();

  return {
    props: {
      prizeList: prizeList,
    },
  };
}

DigitalPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
