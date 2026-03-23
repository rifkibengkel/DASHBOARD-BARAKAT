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
import { HeaderWhitelist, TableWhitelist } from '@/components/pages/Whitelist/Components';
import { useSWRWhitelist } from '@/swr/Whitelist';
import { Filter, Pagination, UsersList } from '@/types';
import { usePageFilter } from '@/hooks/usePageFilter';

const ModalWhitelist = dynamic(() => import('@/components/pages/Whitelist/Components/Modal'), { ssr: false });
const ModalWhitelistDelete = dynamic(() => import('@/components/pages/Whitelist/Components/ModalDelete'), {
    ssr: false,
});

export default function Whitelist() {
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
    const { keys, list, currentPage, dataPerPage, totalData, totalPage, isLoading, isError } = useSWRWhitelist({
        filter,
        pagination,
    });

    const listData = list.map((item: UsersList, index: number) => ({
        ...item,
        no: (currentPage - 1) * dataPerPage + index + 1,
        status_color: item.status && item.status === 1 ? 'success' : 'error',
    }));

    return (
        <>
            <Head>
                <title>{`Whitelist - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderWhitelist pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableWhitelist
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
            <ModalWhitelist keys={keys} />
            <ModalWhitelistDelete keys={keys} />
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

Whitelist.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
