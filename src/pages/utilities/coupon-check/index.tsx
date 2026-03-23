import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { APP_NAME } from "@/lib/common/constant";
import DashboardLayout from "@/components/base/Layout";
import { useDashboardStore } from "@/stores/useDashboard";
import { getLoginSession } from "@/lib/auth/session";
import { HeaderCouponCheck } from "@/components/pages/CouponCheck/Components";
import { CardDefault } from "@/components/base/Card";
import { TextFieldDefault } from "@/components/base/Form/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useNotificationStore } from "@/stores/useNotification";
import { Coupon } from "@/types";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { CouponResultCard } from "@/components/pages/CouponCheck/Components/CouponCard";

export default function CouponCheckPage() {
  const { dashboard } = useDashboardStore();
  const { notify } = useNotificationStore();

  const [localSearch, setLocalSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [coupon, setCoupon] = React.useState<Coupon[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `/api/coupon-check/detail?key=${localSearch.toUpperCase()}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        notify({
          type: "error",
          message: "Coupon not exist",
          position: { vertical: "top", horizontal: "right" },
        });
        return;
      }
      const res = await response.json();
      const { data } = res;
      setCoupon(data);
    } catch (error) {
      notify({
        type: "error",
        message: (error as Error).message,
        position: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`Coupon Check - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderCouponCheck pageRole={dashboard.currentMenu} />
            )}
          </Grid>
          <Grid size={{ xs: 6 }}>
            {dashboard.currentMenu && (
              <CardDefault>
                <Typography
                  variant="h5"
                  textTransform="capitalize"
                  gutterBottom
                >
                  Check Coupon Availability
                </Typography>

                <form onSubmit={handleSearch}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <TextFieldDefault
                      size="small"
                      fullWidth
                      placeholder="Search coupon code..."
                      value={localSearch}
                      onChange={(e) =>
                        setLocalSearch(e.target.value.toUpperCase())
                      }
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ width: 120 }}
                      disabled={!localSearch || loading}
                    >
                      {loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </Stack>
                </form>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  {coupon.length > 0
                    ? coupon.map((item) => (
                        <Grid size={{ xs: 12 }} key={item.coupon}>
                          <CouponResultCard item={item} />
                        </Grid>
                      ))
                    : !loading && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">
                            No coupon found. Try searching by coupon code.
                          </Typography>
                        </Grid>
                      )}
                </Grid>
              </CardDefault>
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

CouponCheckPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
