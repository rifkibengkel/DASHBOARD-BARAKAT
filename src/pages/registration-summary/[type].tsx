import React from 'react';
import Head from 'next/head';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { APP_NAME } from '@/lib/common/constant';
import { useDashboardStore } from '@/stores/useDashboard';
import DashboardLayout from '@/components/base/Layout';
import { getLoginSession } from '@/lib/auth/session';
import { HeaderRegistrationSummary, TableRegistrationSummary } from '@/components/pages/RegistrationSummary/Components';
import { TabsDefault } from '@/components/base/Tabs';
import { CardDefault } from '@/components/base/Card';
import { AreaChart } from '@/components/base/Chart';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useSWRRegistrationSummary } from '@/swr/RegistrationSummary';

export default function EntriesSummaryPage({ type }: { type: string }) {
    const { dashboard } = useDashboardStore();

    const listData = [{ id: 'statistic', name: 'Summary Data' }];

    const [tabList, setTabList] = React.useState<'statistic' | 'summary'>('statistic');
    const [isChange, setIsChange] = React.useState<boolean>(false);

    const handleChange = (e: React.SyntheticEvent, type = 'summary', value: string | number) => {
        setIsChange(true);
        if (type === 'summary') {
            setTabList(value as 'statistic' | 'summary');
        }
        setTimeout(() => setIsChange(false), 500);
    };

    const { data, isLoading } = useSWRRegistrationSummary(type);

    return (
        <>
            <Head>
                <title>{`Registration Summary - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderRegistrationSummary pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TabsDefault
                            type={'summary'}
                            value={tabList}
                            listValue={listData}
                            handleChange={handleChange}
                        />
                        {tabList === 'statistic' && (
                            <Grid container spacing={2} mt={2}>
                                <Grid size={{ xs: 12 }}>
                                    <CardDefault>
                                        <Typography variant="h5" textTransform={'capitalize'} gutterBottom>
                                            {tabList} Overview
                                        </Typography>

                                        {isLoading || isChange ? (
                                            <Skeleton variant="rounded" height={500} />
                                        ) : (
                                            <AreaChart
                                                categories={data.statistic.categories}
                                                series={data.statistic.series}
                                                height={335}
                                            />
                                        )}
                                    </CardDefault>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <CardDefault>
                                        <TableRegistrationSummary
                                            headers={
                                                !isLoading && !isChange && data?.statistic?.list?.length > 0
                                                    ? Object.keys(data.statistic.list[0]).map((key) => {
                                                          return key
                                                              .split(/(?=[A-Z])/)
                                                              .join(' ')
                                                              .replace(/^\w/, (c) => c.toUpperCase());
                                                      })
                                                    : []
                                            }
                                            loading={isLoading || isChange}
                                            rows={
                                                !isLoading && !isChange && data?.statistic?.list
                                                    ? data.statistic.list
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
    const { req, query } = context;
    const session = await getLoginSession(req as NextApiRequest);

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: {
            type: query.type,
        },
    };
}

EntriesSummaryPage.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
