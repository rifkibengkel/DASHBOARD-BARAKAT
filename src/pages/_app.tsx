import { ReactElement, ReactNode, useEffect } from "react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { SWRConfig } from "swr/_internal";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Router from "next/router";
import NProgress from "nprogress";
import { createEmotionCache } from "@/lib/utils";
import { APP_NAME } from "@/lib/common/constant";
import { apiSWR } from "@/lib/common/api";
import NotificationComponent from "@/components/base/Notification";
import "../styles/globals.css";
import "dayjs/locale/id";
import "nprogress/nprogress.css";
import { neumorphismTheme } from "@/themes";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type MyAppProps = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

const clientSideEmotionCache = createEmotionCache();

const App = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);

  NProgress.configure({ showSpinner: false, speed: 100, minimum: 0.3 });

  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleStop);
    Router.events.on("routeChangeError", handleStop);

    return () => {
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleStop);
      Router.events.off("routeChangeError", handleStop);
    };
  }, []);

  const swrFetcher = async (input: string) => {
    NProgress.start();
    try {
      const res = await apiSWR(input);
      return res;
    } finally {
      NProgress.done();
    }
  };

  return (
    <SWRConfig
      value={{
        fetcher: swrFetcher,
        refreshInterval:
          typeof document !== "undefined" && !document.hidden ? 10000 : 0,
        revalidateIfStale: true,
      }}
    >
      <Head>
        <title>{APP_NAME}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={neumorphismTheme}>
          <CssBaseline />
          {getLayout(<Component {...pageProps} />)}
          <NotificationComponent />
        </ThemeProvider>
      </CacheProvider>
    </SWRConfig>
  );
};

export default App;
