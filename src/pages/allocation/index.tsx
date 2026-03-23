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
  HeaderAllocation,
  TableAllocation,
} from "@/components/pages/Allocation/Components";
import { useSWRAllocation } from "@/swr/Allocation";
import { Allocation, BaseQueryResult, Filter, Pagination } from "@/types";
import { usePageFilter } from "@/hooks/usePageFilter";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { getPrize } from "../api/prize/_model";
import { getRegion, getStore } from "../api/master/_model";

const ModalAllocation = dynamic(
  () => import("@/components/pages/Allocation/Components/Modal"),
  { ssr: false },
);

export default function AllocationPage({
  prizeList,
  regionList,
  storeList,
}: {
  prizeList: BaseQueryResult[];
  regionList: BaseQueryResult[];
  storeList: BaseQueryResult[];
}) {
  const { dashboard } = useDashboardStore();
  const getPagination: Pagination = {
    page: 1,
    limit: 10,
  };
  const getFilter: Filter = {
    key: "",
    startDate: "",
    endDate: "",
  };

  const { filter, pagination } = usePageFilter(getPagination, getFilter);
  const {
    keys,
    list,
    currentPage,
    dataPerPage,
    totalData,
    totalPage,
    isLoading,
    isError,
  } = useSWRAllocation({
    filter,
    pagination,
  });

  const listData = list.map((item: Allocation, index: number) => ({
    ...item,
    id: (currentPage - 1) * dataPerPage + index + 1,
    no: (currentPage - 1) * dataPerPage + index + 1,
    allocation_date: dayjs(item.allocation_date).format("DD/MM/YYYY HH:mm:ss"),
  }));

  return (
    <>
      <Head>
        <title>{`Allocation - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderAllocation pageRole={dashboard.currentMenu} />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <TableAllocation
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
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <ModalAllocation
        keys={keys}
        prizeList={prizeList}
        regionList={regionList}
        storeList={storeList}
      />
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
  const regionList = await getRegion();
  const storeList = await getStore();

  return {
    props: {
      prizeList: prizeList,
      regionList: regionList,
      storeList: storeList,
    },
  };
}

AllocationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
