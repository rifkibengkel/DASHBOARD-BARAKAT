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
import { HeaderUsers, TableUsers } from '@/components/pages/Settings/Users/Components';
import { useSWRUserSettings } from '@/swr/UserSettings';
import { Filter, Pagination, Roles, Users } from '@/types';
import { getRolesList } from '@/pages/api/settings/roles/_model';
import { usePageFilter } from '@/hooks/usePageFilter';

const ModalUsers = dynamic(() => import('@/components/pages/Settings/Users/Components/Modal'), { ssr: false });

export default function UserSettings({ roles }: { roles: Roles[] }) {
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
    const { keys, list, currentPage, dataPerPage, totalData, totalPage, isLoading, isError } = useSWRUserSettings({
        filter,
        pagination,
    });

    const listData = list.map((item: Users) => ({
        ...item,
        status_color: item.status && item.status === 1 ? 'success' : 'error',
    }));

    return (
        <>
            <Head>
                <title>{`Users Settings - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderUsers pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableUsers
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
            <ModalUsers keys={keys} roles={roles} />
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

    const roleList = await getRolesList({ column: '', direction: 'asc', key: '', limit: 100, page: 1 });
    const roles = roleList.list.map((item) => {
        return {
            ...item,
            name: item.role,
        };
    });

    return {
        props: {
            roles,
        },
    };
}

UserSettings.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
