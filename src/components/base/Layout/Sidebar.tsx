import React from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MenuList from "./MenuList";
import { buildMenuTree } from "@/lib/utils";
import { Dashboard } from "@/types";

interface SidebarProps {
  dashboard: Dashboard;
  currentPath: string;
  drawerWidth: number;
  drawerWidthCollapsed: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  dashboard,
  currentPath,
  drawerWidth,
  drawerWidthCollapsed,
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Drawer
      variant={"permanent"}
      open={dashboard.collapsed}
      sx={{
        width: dashboard.collapsed ? drawerWidthCollapsed : drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: dashboard.collapsed ? drawerWidthCollapsed : drawerWidth,
          boxSizing: "border-box",
          borderRight: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Image
          src={"/images/logo.png"}
          alt="Logo"
          width={dashboard.collapsed ? 35 : 50}
          height={dashboard.collapsed ? 35 : 50}
          priority
        />
      </Box>
      <MenuList
        menu={buildMenuTree(dashboard.menu)}
        currentPath={currentPath}
        menuCollapsed={dashboard.collapsed}
      />
    </Drawer>
  );
};

export default React.memo(Sidebar);
