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
import { Filter, Pagination, UsersList } from "@/types";
import { usePageFilter } from "@/hooks/usePageFilter";
import { useSWRTestingData } from "@/swr/TestingData";
import {
  HeaderTestingData,
  TableTestingData,
} from "@/components/pages/DeveloperTools/TestingData/Components";
import { TestingDataList } from "@/types/developer-tools";

const ModalTestingData = dynamic(
  () =>
    import("@/components/pages/DeveloperTools/TestingData/Components/Modal"),
  { ssr: false }
);
const ModalTestingDataView = dynamic(
  () =>
    import(
      "@/components/pages/DeveloperTools/TestingData/Components/ModalView"
    ),
  { ssr: false }
);
const ModalTestingDataDelete = dynamic(
  () =>
    import(
      "@/components/pages/DeveloperTools/TestingData/Components/ModalDelete"
    ),
  {
    ssr: false,
  }
);

export default function TestingData() {
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
  } = useSWRTestingData({
    filter,
    pagination,
  });

  const listData = list.map((item: TestingDataList, index: number) => ({
    ...item,
    no: (currentPage - 1) * dataPerPage + index + 1,
    status_color: item.status && item.status === 1 ? "success" : "error",
  }));

  return (
    <>
      <Head>
        <title>{`Testing Data - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderTestingData pageRole={dashboard.currentMenu} />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <TableTestingData
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
      <ModalTestingData keys={keys} />
      <ModalTestingDataView keys={keys} />
      <ModalTestingDataDelete keys={keys} />
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

  return {
    props: {},
  };
}

TestingData.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
