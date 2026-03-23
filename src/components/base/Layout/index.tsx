/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useRouter } from "next/router";
import useSWR from "swr";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useDashboardStore } from "@/stores/useDashboard";

const drawerWidth = 240;
const drawerWidthCollapsed = 60;

const DashboardLayoutComponent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const {
    dashboard,
    setCollapse,
    setMobileView,
    setUserMenu,
    setCurrentMenu,
    resetDashboard,
  } = useDashboardStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const open = Boolean(anchorEl);
  const currentPath: string = router.asPath;

  const handleMenuClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const shouldFetch = dashboard.menu.length === 0;
  const { data } = useSWR(shouldFetch ? "/api/master/menu" : null);

  React.useEffect(() => {
    if (data) {
      setUserMenu({
        menu: data.menu,
        promo: data.promo,
        session: data.session,
      });
    }
  }, [data, setUserMenu]);

  React.useEffect(() => {
    setMobileView(isMobile);
  }, [isMobile, setMobileView]);

  React.useEffect(() => {
    const current = dashboard.menu.find((item) => item.path === router.asPath);

    if (current) {
      setCurrentMenu(current);
    }
  }, [data, router.asPath]);

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100dvh",
        width: "100dvw",
      }}
    >
      <Sidebar
        dashboard={dashboard}
        currentPath={currentPath}
        drawerWidth={drawerWidth}
        drawerWidthCollapsed={drawerWidthCollapsed}
      />
      <Stack
        sx={{
          flexGrow: 1,
          width: `calc(100vw - ${
            dashboard.collapsed ? drawerWidthCollapsed : drawerWidth
          }px)`,
        }}
      >
        <Header
          dashboard={dashboard}
          setCollapse={setCollapse}
          anchorEl={anchorEl}
          open={open}
          handleMenuClick={handleMenuClick}
          handleClose={handleClose}
          resetDashboard={resetDashboard}
          router={router}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
          }}
        >
          {children}
        </Box>
      </Stack>
    </Container>
  );
};

const DashboardLayout = React.memo(DashboardLayoutComponent);
export default DashboardLayout;
