import React from "react";
import Head from "next/head";
import { GetServerSidePropsContext, NextApiRequest } from "next";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { APP_NAME } from "@/lib/common/constant";
import DashboardLayout from "@/components/base/Layout";
import { useDashboardStore } from "@/stores/useDashboard";
import { getLoginSession } from "@/lib/auth/session";
import { HeaderKTPCheck } from "@/components/pages/PromoSettings/KTP/Components";
import { CardDefault } from "@/components/base/Card";
import { TextFieldDefault } from "@/components/base/Form/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useNotificationStore } from "@/stores/useNotification";
import type { KTPCheck as KTPCheckData } from "@/types";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import { KTPResultCard } from "@/components/pages/PromoSettings/KTP/Components/KTPCard";

export default function KTPCheck() {
  const { dashboard } = useDashboardStore();
  const { notify } = useNotificationStore();

  const [localSearch, setLocalSearch] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [ktpData, setKTPData] = React.useState<KTPCheckData[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `/api/promo-settings/ktp/detail?key=${localSearch}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        notify({
          type: "error",
          message: "Format KTP Invalid",
          position: { vertical: "top", horizontal: "right" },
        });
        return;
      }
      const res = await response.json();
      const { data } = res;
      setKTPData([data]);
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
        <title>{`KTP Check - ${APP_NAME}`}</title>
      </Head>
      <Container disableGutters maxWidth={false} sx={{ height: "100%" }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {dashboard.currentMenu && (
              <HeaderKTPCheck pageRole={dashboard.currentMenu} />
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
                  KTP View
                </Typography>

                <form onSubmit={handleSearch}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <TextFieldDefault
                      size="small"
                      fullWidth
                      placeholder="Identity Number (KTP)"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
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
                  {ktpData.length > 0
                    ? ktpData.map((item) => (
                        <Grid size={{ xs: 12 }} key={item.identity}>
                          <KTPResultCard item={item} />
                        </Grid>
                      ))
                    : !loading && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary">
                            No KTP found
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

KTPCheck.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
