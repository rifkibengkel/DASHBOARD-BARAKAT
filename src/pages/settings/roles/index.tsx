import React from 'react';
import Head from 'next/head';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { APP_NAME } from '@/lib/common/constant';
import { useDashboardStore } from '@/stores/useDashboard';
import DashboardLayout from '@/components/base/Layout';
import { getLoginSession } from '@/lib/auth/session';
import { HeaderRoles, TableRoles } from '@/components/pages/Settings/Roles/Components';
import { useSWRRoleSettings } from '@/swr/RoleSettings';
import { Filter, Pagination, Roles } from '@/types';
import { usePageFilter } from '@/hooks/usePageFilter';

export default function RoleSettings() {
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
    const { keys, list, currentPage, dataPerPage, totalData, totalPage, isLoading, isError } = useSWRRoleSettings({
        filter,
        pagination,
    });

    const listData = list.map((item: Roles) => ({
        ...item,
        id: item.id,
        name: item.role,
        status_color: item.status && item.status === 1 ? 'success' : 'error',
    }));

    return (
        <>
            <Head>
                <title>{`Roles Settings - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderRoles pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableRoles
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

RoleSettings.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
