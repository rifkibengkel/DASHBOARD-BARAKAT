import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { APP_NAME } from '@/lib/common/constant';
import { useDashboardStore } from '@/stores/useDashboard';
import DashboardLayout from '@/components/base/Layout';
import { getLoginSession } from '@/lib/auth/session';
import { HeaderConsumerData, TableConsumerData } from '@/components/pages/ConsumerData/Components';
import { useSWRConsumerData } from '@/swr/ConsumerData';
import { ConsumerData, Filter, Pagination } from '@/types';
import dayjs from 'dayjs';
import { usePageFilter } from '@/hooks/usePageFilter';
import { formatToIDR } from '@/lib/utils';

const ModalFilter = dynamic(() => import('@/components/pages/ConsumerData/Components/ModalFilter'));
const ModalTransaction = dynamic(() => import('@/components/pages/ConsumerData/Components/ModalTransaction'));

export default function ConsumerDataPage() {
    const { dashboard } = useDashboardStore();
    const getPagination: Pagination = {
        page: 1,
        limit: 10,
    };
    const getFilter: Filter = {
        key: '',
        startDate: '',
        endDate: '',
    };

    const { filter, pagination } = usePageFilter(getPagination, getFilter);
    const { keys, list, currentPage, totalPage, dataPerPage, totalData, isLoading, isError } = useSWRConsumerData({
        filter,
        pagination,
    });

    const listData = list.map((item: ConsumerData, index: number) => ({
        ...item,
        no: (currentPage - 1) * dataPerPage + index + 1,
        balance: list.length - 1 === index ? '' : formatToIDR(+item.balance),
        created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
    }));

    return (
        <>
            <Head>
                <title>{`Consumer Data - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderConsumerData pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableConsumerData
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
            <ModalTransaction />
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req } = context;
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
        props: {},
    };
}

ConsumerDataPage.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
