import React, { useMemo, useState } from "react";
import Head from "next/head";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import dynamic from "next/dynamic";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import DashboardLayout from "@/components/base/Layout";
import { getLoginSession } from "@/lib/auth/session";
import { APP_NAME } from "@/lib/common/constant";
import { CardDefault, CardStatsModern } from "@/components/base/Card";
import { TabsDefault } from "@/components/base/Tabs";
import {
  useSWRDemographic,
  useSWREntriesStatistic,
  useSWRUsers,
  useSWRUsersStatistic,
} from "@/swr/Dashboard";
// Icons for stats cards
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const AreaChart = dynamic(
  () => import("@/components/base/Chart").then((mod) => mod.AreaChart),
  { ssr: false }
);
const PieChart = dynamic(
  () => import("@/components/base/Chart").then((mod) => mod.PieChart),
  { ssr: false }
);

export default function Dashboard() {
  const [entryPeriod, setEntryPeriod] = useState<string>("daily");
  const [userPeriod, setUserPeriod] = useState<string>("daily");

  const { demographicsData, demographicsDataLoading } = useSWRDemographic();
  const { userData, userDataLoading, isEnableDetailStats } = useSWRUsers();

  const { entryStatistic, entryStatisticLoading } = useSWREntriesStatistic({
    type: entryPeriod,
  });
  const { userStatistic, userStatisticLoading } = useSWRUsersStatistic({
    type: userPeriod,
  });

  const handleChange = (
    e: React.SyntheticEvent,
    type: string,
    value: string | number
  ) => {
    if (type === "entries") {
      setEntryPeriod(value as string);
    } else if (type === "users") {
      setUserPeriod(value as string);
    }
  };

  const memoEntryData = useMemo(() => entryStatistic, [entryStatistic]);
  const memoUserData = useMemo(() => userStatistic, [userStatistic]);
  const memoDemographicsData = useMemo(
    () => demographicsData,
    [demographicsData]
  );

  return (
    <>
      <Head>
        <title>{`Dashboard - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={3}>
          {/* Stats Cards Row */}
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="User Registered"
              value={userData?.users?.total_users || 0}
              subtitle={
                userData?.users.percentage_change
                  ? `${userData.users.percentage_change > 0 ? "+" : ""}${
                      userData.users.percentage_change
                    }% from last month`
                  : "Total registered users"
              }
              icon={PeopleIcon}
              variant="primary"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Unique Consumer"
              value={userData?.entries?.[0]?.unique_user_entries || 0}
              subtitle={
                userData?.entries?.[0]?.unique_user_entries_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.unique_user_entries_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.unique_user_entries_percentage_change
                    }% from last month`
                  : "Valid entries only"
              }
              icon={PersonIcon}
              variant="success"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Entries"
              value={userData?.entries?.[0]?.total_entries || 0}
              subtitle={
                userData?.entries?.[0]?.total_entries_percentage_change
                  ? `${
                      userData.entries?.[0]?.total_entries_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]?.total_entries_percentage_change
                    }% from last month`
                  : "All entries"
              }
              icon={ReceiptLongIcon}
              variant="info"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Valid Entries"
              value={userData?.entries?.[0]?.total_valid_entries || 0}
              subtitle={
                userData?.entries?.[0]?.total_valid_entries_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.total_valid_entries_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.total_valid_entries_percentage_change
                    }% from last month`
                  : "Validated entries"
              }
              icon={CheckCircleIcon}
              variant="success"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Invalid Entries"
              value={userData?.entries?.[0]?.total_invalid_entries || 0}
              subtitle={
                userData?.entries?.[0]?.total_invalid_entries_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.total_invalid_entries_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.total_invalid_entries_percentage_change
                    }% from last month`
                  : "Invalid entries"
              }
              icon={ErrorIcon}
              variant="error"
              loading={userDataLoading}
            />
          </Grid>

          {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CardStatsModern
              label="Total Approved Entries"
              value={userData?.entries?.[0]?.total_valid_entries_by_admin || 0}
              subtitle={
                userData?.entries?.[0]
                  ?.total_valid_entries_by_admin_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.total_valid_entries_by_admin_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.total_valid_entries_by_admin_percentage_change
                    }% from last month`
                  : "Approved by admin"
              }
              icon={ThumbUpIcon}
              variant="success"
              loading={userDataLoading}
            />
          </Grid> */}

          {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CardStatsModern
              label="Total Reject Entries"
              value={
                userData?.entries?.[0]?.total_invalid_entries_by_admin || 0
              }
              subtitle={
                userData?.entries?.[0]
                  ?.total_invalid_entries_by_admin_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.total_invalid_entries_by_admin_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.total_invalid_entries_by_admin_percentage_change
                    }% from last month`
                  : "Rejected by admin"
              }
              icon={ThumbDownIcon}
              variant="error"
              loading={userDataLoading}
            />
          </Grid> */}

          {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CardStatsModern
              label="Total Unprocessed Entries"
              value={userData?.entries?.[0]?.total_unprocessed_entries || 0}
              subtitle={
                userData?.entries?.[0]
                  ?.total_unprocessed_entries_percentage_change
                  ? `${
                      userData.entries?.[0]
                        ?.total_unprocessed_entries_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[0]
                        ?.total_unprocessed_entries_percentage_change
                    }% from last month`
                  : "Unprocessed by admin"
              }
              icon={HourglassEmptyIcon}
              variant="warning"
              loading={userDataLoading}
            />
          </Grid> */}

          {
            //done
          }

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Winner Tidak Beruntung"
              value={userData?.entries?.[1]?.total_not_luck_totals || 0}
              subtitle={
                userData?.entries?.[1]?.total_not_lucky_percentage_change
                  ? `${
                      userData.entries?.[1]?.total_not_lucky_percentage_change >
                      0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[1]?.total_not_lucky_percentage_change
                    }% from last month`
                  : "Not lucky winner"
              }
              icon={ErrorIcon}
              variant="error"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Approved Winner"
              value={userData?.entries?.[1]?.total_approve_winner_totals || 0}
              subtitle={
                userData?.entries?.[1]?.total_valid_winner_percentage_change
                  ? `${
                      userData.entries?.[1]
                        ?.total_valid_winner_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[1]
                        ?.total_valid_winner_percentage_change
                    }% from last month`
                  : "Approved by admin"
              }
              icon={ThumbUpIcon}
              variant="success"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Reject Winner"
              value={userData?.entries?.[1]?.total_reject_winner_totals || 0}
              subtitle={
                userData?.entries?.[1]?.winner_reject_percentage_change
                  ? `${
                      userData.entries?.[1]?.winner_reject_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[1]?.winner_reject_percentage_change
                    }% from last month`
                  : "Rejected by admin"
              }
              icon={ThumbDownIcon}
              variant="error"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <CardStatsModern
              label="Total Unprocessed Winner"
              value={
                userData?.entries?.[1]?.total_unprocessed_winner_totals || 0
              }
              subtitle={
                userData?.entries?.[1]
                  ?.total_unprocessed_winner_percentage_change
                  ? `${
                      userData.entries?.[1]
                        ?.total_unprocessed_winner_percentage_change > 0
                        ? "+"
                        : ""
                    }${
                      userData.entries?.[1]
                        ?.total_unprocessed_winner_percentage_change
                    }% from last month`
                  : "Unprocessed by admin"
              }
              icon={HourglassEmptyIcon}
              variant="warning"
              loading={userDataLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <CardDefault minHeight={500}>
              <TabsDefault
                type="entries"
                value={entryPeriod}
                listValue={[
                  { id: "daily", name: "Daily" },
                  { id: "weekly", name: "Weekly" },
                  { id: "monthly", name: "Monthly" },
                ]}
                handleChange={handleChange}
              />
              <Stack>
                <Typography variant="h5">Total Incoming Entries</Typography>
                {entryStatisticLoading ? (
                  <Skeleton variant="rounded" height={350} />
                ) : (
                  <AreaChart
                    categories={memoEntryData.categories}
                    series={memoEntryData.series}
                    height={335}
                  />
                )}
              </Stack>
            </CardDefault>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CardDefault minHeight={500}>
              <Typography variant="h5">Profile by Age</Typography>
              {!demographicsDataLoading && memoDemographicsData ? (
                <PieChart
                  label={memoDemographicsData.age_group.categories}
                  series={memoDemographicsData.age_group.series}
                  height={400}
                />
              ) : (
                <Skeleton variant="rounded" height={400} />
              )}
            </CardDefault>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CardDefault minHeight={500}>
              <Typography variant="h5">Profile by Gender</Typography>
              {!demographicsDataLoading && memoDemographicsData ? (
                <PieChart
                  label={memoDemographicsData.gender.categories}
                  series={memoDemographicsData.gender.series}
                  height={400}
                />
              ) : (
                <Skeleton variant="rounded" height={400} />
              )}
            </CardDefault>
          </Grid>

          {/* User Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <CardDefault minHeight={500}>
              <TabsDefault
                type="users"
                value={userPeriod}
                listValue={[
                  { id: "daily", name: "Daily" },
                  { id: "weekly", name: "Weekly" },
                  { id: "monthly", name: "Monthly" },
                ]}
                handleChange={handleChange}
              />
              <Stack>
                <Typography variant="h5">Total Users Registered</Typography>
                {userStatisticLoading ? (
                  <Skeleton variant="rounded" height={350} />
                ) : (
                  <AreaChart
                    categories={memoUserData.categories}
                    series={memoUserData.series}
                    height={335}
                  />
                )}
              </Stack>
            </CardDefault>
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
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: {} };
}

Dashboard.getLayout = (page: React.ReactElement) => (
  <DashboardLayout>{page}</DashboardLayout>
);
