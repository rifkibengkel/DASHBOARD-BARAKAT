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
import { HeaderRegistration, TableRegistration } from '@/components/pages/Registration/Components';
import { useSWRRegistration } from '@/swr/Registration';
import { Filter, Pagination, RegistrationData } from '@/types';
import dayjs from 'dayjs';
import { usePageFilter } from '@/hooks/usePageFilter';

const ModalFilter = dynamic(() => import('@/components/pages/Registration/Components/ModalFilter'));

export default function RegistrationPage() {
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
    const { keys, list, currentPage, totalPage, dataPerPage, totalData, isLoading, isError } = useSWRRegistration({
        filter,
        pagination,
    });

    const listData = list.map((item: RegistrationData, index: number) => ({
        ...item,
        no: (currentPage - 1) * dataPerPage + index + 1,
        birthdate: item.birthdate ? dayjs(item.birthdate).format('DD/MM/YYYY') : '-',
        city: item.city ? item.city : '-',
        created_at: dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss'),
    }));

    return (
        <>
            <Head>
                <title>{`Registration Data - ${APP_NAME}`}</title>
            </Head>
            <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && <HeaderRegistration pageRole={dashboard.currentMenu} />}
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        {dashboard.currentMenu && (
                            <TableRegistration
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

RegistrationPage.getLayout = function getLayout(page: React.ReactElement) {
    return <DashboardLayout>{page}</DashboardLayout>;
};
