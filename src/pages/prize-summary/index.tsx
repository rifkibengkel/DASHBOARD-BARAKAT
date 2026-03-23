/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { APP_NAME } from "@/lib/common/constant";
import { useDashboardStore } from "@/stores/useDashboard";
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import {
  HeaderPrizeSummary,
  TablePrizeSummary,
} from "@/components/pages/PrizeSummary/Components";
import { useSWRPrize } from "@/swr/Prize";
import { CardDefault } from "@/components/base/Card";
import { useFilterStore } from "@/stores/useFilter";
import { Typography } from "@mui/material";

export default function PrizeSummaryPage() {
  const { dashboard } = useDashboardStore();
  const { filter } = useFilterStore();

  const { data, isLoading } = useSWRPrize();

  const prizeList = Array.isArray(data?.prizeList) ? data.prizeList : [];

  // ⬅️ Pisahkan hadiah langsung & tidak langsung
  const directPrize = prizeList.filter((item) => item.typeId === 1);
  const nondirectPrize = prizeList.filter((item) => item.typeId === 2);

  const buildHeaders = (rows: any[]) =>
    rows.length > 0
      ? Object.keys(rows[0])
          .filter((key) => key !== "id" && key !== "typeId")
          .map((key) =>
            key
              .split(/(?=[A-Z])/)
              .join(" ")
              .replace(/^\w/, (c) => c.toUpperCase())
          )
      : [];

  const buildRows = (rows: any[]) =>
    rows.map(({ id: _id, typeId: _typeId, ...rest }) => rest);

  return (
    <>
      <Head>
        <title>{`Prize Summary - ${APP_NAME}`}</title>
      </Head>

      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderPrizeSummary pageRole={dashboard.currentMenu} />
            )}
          </Grid>

          {/* ================= TABLE 1: HADIAH LANGSUNG ================= */}
          <Grid size={{ xs: 6 }} ml={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              1. Hadiah Langsung
            </Typography>
            <CardDefault>
              <TablePrizeSummary
                headers={!isLoading ? buildHeaders(directPrize) : []}
                loading={isLoading}
                rows={!isLoading ? buildRows(directPrize) : []}
                loadingRows={10}
              />
            </CardDefault>
          </Grid>
        </Grid>
        <Grid container mt={4} spacing={2}>
          {/* ================= TABLE 2: HADIAH TIDAK LANGSUNG ================= */}
          {/* <Grid size={{ xs: 6 }} ml={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              2. Hadiah Tidak Langsung
            </Typography>
            <CardDefault>
              <TablePrizeSummary
                headers={!isLoading ? buildHeaders(nondirectPrize) : []}
                loading={isLoading}
                rows={!isLoading ? buildRows(nondirectPrize) : []}
                loadingRows={10}
              />
            </CardDefault>
          </Grid> */}
        </Grid>
      </Container>
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

PrizeSummaryPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
