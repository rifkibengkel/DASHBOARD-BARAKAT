import React from "react";
import HelpOutline from "@mui/icons-material/HelpOutline";
import Dashboard from "@mui/icons-material/Dashboard";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import Inbox from "@mui/icons-material/Inbox";
import ListAlt from "@mui/icons-material/ListAlt";
import Group from "@mui/icons-material/Group";
import ShowChart from "@mui/icons-material/ShowChart";
import PieChart from "@mui/icons-material/PieChart";
import Cancel from "@mui/icons-material/Cancel";
import CheckCircle from "@mui/icons-material/CheckCircle";
import MyLocation from "@mui/icons-material/MyLocation";
import LocalOffer from "@mui/icons-material/LocalOffer";
import Whatshot from "@mui/icons-material/Whatshot";
import EmojiEvents from "@mui/icons-material/EmojiEvents";
import MilitaryTech from "@mui/icons-material/MilitaryTech";
import BarChart from "@mui/icons-material/BarChart";
import Person from "@mui/icons-material/Person";
import List from "@mui/icons-material/List";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import MopedOutlinedIcon from "@mui/icons-material/MopedOutlined";
import CalendarViewDayOutlinedIcon from "@mui/icons-material/CalendarViewDayOutlined";
import CalendarViewMonthOutlinedIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import CalendarViewWeekOutlinedIcon from "@mui/icons-material/CalendarViewWeekOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import GamepadOutlinedIcon from "@mui/icons-material/GamepadOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";

interface MenuSelectorProps {
  type: string;
}

const MenuSelectorComponent: React.FC<MenuSelectorProps> = ({ type }) => {
  const Icons: Record<string, React.JSX.Element> = {
    QuestionOutlined: <HelpOutline />,
    DashboardOutlined: <Dashboard />,
    SettingOutlined: <Settings />,
    LogoutOutlined: <Logout />,
    InboxOutlined: <Inbox />,
    VerifiedOutlined: <VerifiedIcon />,
    UnorderedListOutlined: <ListAlt />,
    TeamOutlined: <Group />,
    LineChartOutlined: <ShowChart />,
    PieChartOutlined: <PieChart />,
    CloseCircleOutlined: <Cancel />,
    CheckCircleOutlined: <CheckCircle />,
    AimOutlined: <MyLocation />,
    TagOutlined: <LocalOffer />,
    HeatMapOutlined: <Whatshot />,
    CrownOutlined: <MilitaryTech />,
    TrophyOutlined: <EmojiEvents />,
    BarChartOutlined: <BarChart />,
    PersonOutlined: <Person />,
    ListOutlined: <List />,
    AdminPanelOutlined: <AdminPanelSettings />,
    AccountBallanceOutlined: <AccountBalanceWalletOutlinedIcon />,
    MopedOutlined: <MopedOutlinedIcon />,
    CalendarDayOutlined: <CalendarViewDayOutlinedIcon />,
    CalendarMonthOutlined: <CalendarViewMonthOutlinedIcon />,
    CalendarYearOutlined: <CalendarViewWeekOutlinedIcon />,
    MenuOutlined: <WidgetsOutlinedIcon />,
    RoleOutlined: <GamepadOutlinedIcon />,
    BuildOutlined: <BuildOutlinedIcon />,
    LocalOfferOutlined: <LocalOfferOutlinedIcon />,
    CreditCardOutlined: <CreditCardOutlinedIcon />,
  };

  const iconElement = Icons[type] || <HelpOutline />;
  // Clone the icon and add aria-label for accessibility
  return React.cloneElement(iconElement, {
    "aria-label": type,
    sx: { fontSize: "1.25rem" },
  });
};

export default React.memo(MenuSelectorComponent);
