import React from 'react';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import Head from 'next/head';
import Container from '@mui/material/Container';
import { APP_NAME } from '@/lib/common/constant';
import FormLogin from '@/components/pages/Login/FormLogin';
import { getLoginSession } from '@/lib/auth/session';

export default function Login() {
    return (
        <>
            <Head>
                <title>{`Login - ${APP_NAME}`}</title>
            </Head>
            <Container
                sx={{
                    height: '100dvh',
                    background: 'url(/images/background.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',

                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                maxWidth={false}
                disableGutters
            >
                <FormLogin />
            </Container>
        </>
    );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req } = context;
    const session = await getLoginSession(req as NextApiRequest);

    if (session) {
        return {
            redirect: {
                destination: '/login/redirect',
                permanent: false,
            },
            props: { session },
        };
    }

    return {
        props: {},
    };
}

Login.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
