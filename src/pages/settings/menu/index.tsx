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
import { HeaderMenu } from '@/components/pages/Settings/Menu/Components';
import { useSWRMenuSettings } from '@/swr/MenuSettings';
import { TableMenu } from '@/components/pages/Settings/Menu/Components/Table';
import { buildMenuTree } from '@/lib/utils';
import { Filter, Menu, Pagination } from '@/types';
import { usePageFilter } from '@/hooks/usePageFilter';

const ModalMenu = dynamic(() => import('@/components/pages/Settings/Menu/Components/Modal'), { ssr: false });

export default function MenuSettings() {
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

    const { filter } = usePageFilter(getPagination, getFilter);
    const { keys, list, dataPerPage, currentPage, totalPage, totalData, isLoading, isError } = useSWRMenuSettings({
        filter,
    });

    const listData = buildMenuTree(
        list.map((item: Menu) => ({
            ...item,
            id: item.id,
            name: item.menu,
            status_color: item.status && item.status === 1 ? 'success' : 'error',
        }))
    );

    return (
        <>
            <Head>
                <title>{`Menu Settings - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderMenu pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableMenu
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
            <ModalMenu keys={keys} menu={listData} />
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

    return { props: {} };
}

MenuSettings.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
