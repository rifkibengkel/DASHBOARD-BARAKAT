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
  HeaderEntries,
  TableEntries,
} from "@/components/pages/Entries/Components";
import { useSWREntries } from "@/swr/Entries";
import { BaseQueryResult, Entries, Filter, Pagination } from "@/types";
import { getApprovedColor, getValidColor } from "@/lib/utils";
import { usePageFilter } from "@/hooks/usePageFilter";
import { getPrizeCategory } from "../api/master/_model";

const ModalFilter = dynamic(
  () => import("@/components/pages/Entries/Components/ModalFilter")
);

export default function EntriesPage({
  prizeCategoryList,
}: {
  prizeCategoryList: BaseQueryResult[];
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
    isValid: -1,
    isValidAdmin: -1,
    isApprovedAdmin: -1,
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
  } = useSWREntries({
    filter,
    pagination,
  });

  const listData = list.map((item: Entries, index: number) => ({
    ...item,
    no: (currentPage - 1) * dataPerPage + index + 1,
    coupon:
      item.coupon && item.coupon.length > 30
        ? `${item.coupon.substring(0, 30)}...`
        : item.coupon,
    is_valid_color: getValidColor(item.is_valid, item.status),
    is_approved_color: getApprovedColor(item.is_approved),
    is_valid_admin_color: getValidColor(item.is_valid_admin),
    is_approved_admin_color: getApprovedColor(item.is_approved_admin),
  }));

  return (
    <>
      <Head>
        <title>{`Entries - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderEntries
                pageRole={dashboard.currentMenu}
                prizeCategoryList={prizeCategoryList}
              />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <TableEntries
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
      <ModalFilter />
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

  const prizeCategoryList = await getPrizeCategory();

  return {
    props: {
      prizeCategoryList: prizeCategoryList,
    },
  };
}

EntriesPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
