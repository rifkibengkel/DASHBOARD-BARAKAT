import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { APP_NAME } from "@/lib/common/constant";
import { useDashboardStore } from "@/stores/useDashboard";
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import {
  HeaderDemographic,
  TableDemographic,
} from "@/components/pages/Demographic/Components";
import { TabsDefault } from "@/components/base/Tabs";
import { PieChart } from "@/components/base/Chart";
import { CardDefault } from "@/components/base/Card";
import { useSWRDemographic } from "@/swr/Demographic";

export default function DemographicPage() {
  const { dashboard } = useDashboardStore();

  const listData = [
    { id: "gender", name: "Data Gender" },
    { id: "age", name: "Data Age" },
    { id: "distribution", name: "Data Distribution (KTP)" },
    { id: "store", name: "Data Distribution By Store" },
  ];

  const [tabList, setTabList] = React.useState<
    "gender" | "age" | "distribution" | "store"
  >("gender");
  const [isChange, setIsChange] = React.useState<boolean>(false);

  const handleChange = (
    e: React.SyntheticEvent,
    type = "demographic",
    value: string | number
  ) => {
    setIsChange(true);
    if (type === "demographic") {
      setTabList(value as "gender" | "age" | "distribution");
    }
    setTimeout(() => setIsChange(false), 500);
  };

  const { data, isLoading } = useSWRDemographic();

  return (
    <>
      <Head>
        <title>{`Demographic - ${APP_NAME}`}</title>
      </Head>

      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderDemographic pageRole={dashboard.currentMenu} />
            )}
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TabsDefault
              type={"demographic"}
              value={tabList}
              listValue={listData}
              handleChange={handleChange}
            />

            {/* Gender or Age Tabs */}
            {["gender", "age"].includes(tabList) && (
              <Grid container spacing={2} mt={2}>
                <Grid size={{ xs: 7 }}>
                  <CardDefault>
                    <Typography
                      variant="h5"
                      textTransform={"capitalize"}
                      gutterBottom
                    >
                      {tabList} Demographics Overview
                    </Typography>

                    {isLoading || isChange ? (
                      <Skeleton variant="rounded" height={600} />
                    ) : (
                      <PieChart
                        label={data[tabList as "gender" | "age"].categories}
                        series={data[tabList as "gender" | "age"].series}
                        height={600}
                      />
                    )}
                  </CardDefault>
                </Grid>

                <Grid size={{ xs: 5 }}>
                  <CardDefault>
                    <Typography
                      variant="h6"
                      gutterBottom
                      textTransform={"capitalize"}
                    >
                      {tabList} Distribution
                    </Typography>

                    <TableDemographic
                      headers={["Category", "Count", "Percentage"]}
                      loading={isLoading || isChange}
                      rows={
                        !isLoading && !isChange
                          ? [
                              ...data[
                                tabList as "gender" | "age"
                              ].categories.map(
                                (category: string, index: number) => {
                                  const count =
                                    data[tabList as "gender" | "age"].series[
                                      index
                                    ];
                                  const total = data[
                                    tabList as "gender" | "age"
                                  ].series.reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                  );
                                  const percentage =
                                    total > 0
                                      ? ((count / total) * 100).toFixed(1)
                                      : "0.0";
                                  return {
                                    category,
                                    count: count.toLocaleString(),
                                    percentage: `${percentage}%`,
                                  };
                                }
                              ),
                              {
                                category: "Total",
                                count: data[tabList as "gender" | "age"].series
                                  .reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                  )
                                  .toLocaleString(),
                                percentage: "100.0%",
                              },
                            ]
                          : []
                      }
                      loadingRows={5}
                    />
                  </CardDefault>
                </Grid>
              </Grid>
            )}

            {/* KTP Distribution Tab */}
            {tabList === "distribution" && (
              <Grid container spacing={2} mt={2}>
                <Grid size={{ xs: 6 }}>
                  <CardDefault>
                    <Typography variant="h5" textTransform={"capitalize"}>
                      Entries Distribution
                    </Typography>
                    {isLoading || isChange ? (
                      <Skeleton variant="rounded" height={400} />
                    ) : (
                      <PieChart
                        label={data?.ktp?.overall?.categories || []}
                        series={data?.ktp?.overall?.series || []}
                        height={400}
                      />
                    )}
                  </CardDefault>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <CardDefault>
                    <Typography variant="h5" textTransform={"capitalize"}>
                      Entries Distribution by City
                    </Typography>
                    {isLoading || isChange ? (
                      <Skeleton variant="rounded" height={400} />
                    ) : (
                      <PieChart
                        label={data?.ktp?.perCity?.categories || []}
                        series={data?.ktp?.perCity?.series || []}
                        height={400}
                      />
                    )}
                  </CardDefault>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CardDefault>
                    <Typography variant="h6" gutterBottom>
                      Entries Distribution Details
                    </Typography>

                    <TableDemographic
                      headers={[
                        "City",
                        "Valid Entries",
                        "Invalid Entries",
                        "Total Entries",
                        "Unique Users",
                      ]}
                      loading={isLoading || isChange}
                      rows={
                        !isLoading && !isChange
                          ? [
                              ...(data?.ktp?.list?.map((city) => ({
                                city: city.city,
                                "valid entries": city.valid.toLocaleString(),
                                "invalid entries":
                                  city.invalid.toLocaleString(),
                                "total entries": city.total.toLocaleString(),
                                "unique users":
                                  city.uniqueUsers.toLocaleString(),
                              })) || []),
                              {
                                city: "Total",
                                "valid entries": (
                                  data?.ktp?.list?.reduce(
                                    (sum: number, city) => sum + city.valid,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "invalid entries": (
                                  data?.ktp?.list?.reduce(
                                    (sum: number, city) => sum + city.invalid,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "total entries": (
                                  data?.ktp?.list?.reduce(
                                    (sum: number, city) => sum + city.total,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "unique users": (
                                  data?.ktp?.list?.reduce(
                                    (sum: number, city) =>
                                      sum + city.uniqueUsers,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                              },
                            ]
                          : []
                      }
                      loadingRows={10}
                    />
                  </CardDefault>
                </Grid>
              </Grid>
            )}

            {tabList === "store" && (
              <Grid container spacing={2} mt={2}>
                <Grid size={{ xs: 12 }}>
                  <CardDefault>
                    <Typography variant="h5" textTransform={"capitalize"}>
                      Entries Distribution by Store
                    </Typography>
                    {isLoading || isChange ? (
                      <Skeleton variant="rounded" height={400} />
                    ) : (
                      <PieChart
                        label={data?.store?.categories || []}
                        series={data?.store?.series || []}
                        height={400}
                      />
                    )}
                  </CardDefault>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <CardDefault>
                    <Typography variant="h6" gutterBottom>
                      Entries Distribution By Store
                    </Typography>

                    <TableDemographic
                      headers={[
                        // "tanggal",
                        // "city",
                        "store",
                        "unique users",
                        "valid store",
                        "invalid store",
                        "total store",
                      ]}
                      loading={isLoading || isChange}
                      // rows={data?.demo?.table as any}
                      rows={
                        !isLoading && !isChange
                          ? [
                              ...(data?.demo?.table?.map((store: any) => ({
                                store: store?.store,
                                "valid store": store.valid?.toLocaleString(),
                                "invalid store":
                                  store.invalid?.toLocaleString(),
                                "total store": store.total.toLocaleString(),
                                "unique users":
                                  store.uniqueusers.toLocaleString(),
                              })) || []),
                              {
                                store: "Total",
                                "valid store": (
                                  data?.demo?.table?.reduce(
                                    (sum: number, store: any) =>
                                      sum + store.valid,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "invalid store": (
                                  data?.demo?.table?.reduce(
                                    (sum: number, store: any) =>
                                      sum + store.invalid,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "total store": (
                                  data?.demo?.table?.reduce(
                                    (sum: number, store: any) =>
                                      sum + store.total,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                                "unique users": (
                                  data?.demo?.table?.reduce(
                                    (sum: number, store: any) =>
                                      sum + store.uniqueusers,
                                    0
                                  ) || 0
                                ).toLocaleString(),
                              },
                            ]
                          : []
                      }
                      loadingRows={10}
                    />
                  </CardDefault>
                </Grid>
              </Grid>
            )}
          </Grid>
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
      redirect: { destination: "/login", permanent: false },
    };
  }

  return { props: {} };
}

DemographicPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
