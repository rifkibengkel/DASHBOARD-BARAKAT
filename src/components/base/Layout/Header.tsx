import React from "react";
import { NextRouter } from "next/router";
import dayjs from "dayjs";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { APP_NAME } from "@/lib/common/constant";
import { Dashboard } from "@/types";
import { neumorphismTheme } from "@/themes";

interface HeaderProps {
  dashboard: Dashboard;
  setCollapse: () => void;
  anchorEl: HTMLElement | null;
  open: boolean;
  handleMenuClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleClose: () => void;
  resetDashboard: () => void;
  router: NextRouter;
}

const Header: React.FC<HeaderProps> = ({
  dashboard,
  setCollapse,
  anchorEl,
  open,
  handleMenuClick,
  handleClose,
  resetDashboard,
  router,
}) => (
  <Stack
    flexDirection="row"
    justifyContent="space-between"
    p={2}
    sx={{
      position: "sticky",
      zIndex: 10,
      top: 0,
      minHeight: 75,
      background: neumorphismTheme.palette.background.default,
    }}
  >
    <Stack flexDirection="row" alignItems="center" gap={2}>
      <Box
        sx={{ display: "flex", justifyContent: "start", alignItems: "center" }}
      >
        <IconButton
          onClick={setCollapse}
          aria-label={
            dashboard.collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {dashboard.collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
      <Box>
        <Typography variant="h6">{APP_NAME}</Typography>
        <Typography variant="body1">
          {dashboard.promo.periode_start
            ? dayjs(dashboard.promo.periode_start)
                .locale("id")
                .format("DD MMMM YYYY")
            : "-"}{" "}
          -{" "}
          {dashboard.promo.periode_end
            ? dayjs(dashboard.promo.periode_end)
                .locale("id")
                .format("DD MMMM YYYY")
            : "-"}
        </Typography>
      </Box>
    </Stack>
    <Stack flexDirection="row" alignItems="center" gap={2}>
      <Box
        display="flex"
        alignItems="center"
        onClick={handleMenuClick}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-label="Open user menu"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleMenuClick({
              ...e,
              nativeEvent: e.nativeEvent,
              currentTarget: e.currentTarget,
              target: e.target,
              type: "click",
            } as unknown as React.MouseEvent<HTMLDivElement>);
          }
        }}
      >
        <Avatar
          sx={{ mr: 1 }}
          aria-label={
            dashboard.session.name
              ? `Avatar for ${dashboard.session.name}`
              : "User Avatar"
          }
        >
          {dashboard.session.name ? dashboard.session.name.charAt(0) : "U"}
        </Avatar>
        <Box sx={{ mr: 2 }}>
          <Typography variant="subtitle1">
            {dashboard.session.name ? dashboard.session.name : "User Profile"}
          </Typography>
          <Typography variant="subtitle2">
            {dashboard.session.role ? dashboard.session.role : "User Role"}
          </Typography>
        </Box>
        <ExpandMoreIcon fontSize="small" aria-label="Expand user menu" />
      </Box>
    </Stack>
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiPaper-root": {
          minWidth: anchorEl?.offsetWidth || "auto",
        },
      }}
    >
      <MenuItem
        onClick={() => {
          handleClose();
          resetDashboard();
          router.push("/api/auth/logout");
        }}
      >
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  </Stack>
);

export default React.memo(Header);
