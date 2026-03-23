import React from 'react';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import { getLoginSession } from '@/lib/auth/session';
import { Menu } from '@/types';
import { getMenu } from '@/pages/api/master/_model';
import { buildMenuTree } from '@/lib/utils';

export default function LoginRedirect() {
    return <></>;
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

    const menu: Menu[] = await getMenu(session.username);
    const menuBuild = buildMenuTree(menu);
    return {
        redirect: {
            destination: menuBuild[0].children.length > 0 ? menuBuild[0].children[0].path : menuBuild[0].path,
            permanent: false,
        },
        props: { session },
    };
}

LoginRedirect.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};
