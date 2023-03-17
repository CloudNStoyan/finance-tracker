import { Drawer, IconButton } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useAppSelector } from "../state/hooks";
import TopbarStyled from "./Topbar.styled";
import WestIcon from "@mui/icons-material/West";
import { useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsModal from "../pages/SettingsModal";

const navigateBackMap: { [key: string]: string } = {
  "/transaction": "/",
  "/categories": "/",
  "/category": "/categories",
};

const MobileTopbar: FunctionComponent = () => {
  const navigate = useNavigate();

  const { isLoggedIn, user } = useAppSelector((state) => state.authReducer);

  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const { pathname } = useLocation();

  const canGoBack = pathname !== "/";

  const navigateBack = () => {
    if (!canGoBack || !(pathname in navigateBackMap)) {
      return;
    }

    navigate(navigateBackMap[pathname]);
  };

  return (
    isLoggedIn &&
    user.activated && (
      <TopbarStyled
        className={`flex ${
          canGoBack ? "justify-between" : "justify-end"
        } items-center py-2`}
      >
        {canGoBack && (
          <IconButton
            size="small"
            className="text-white ml-2"
            onClick={() => navigateBack()}
          >
            <WestIcon />
          </IconButton>
        )}

        <div>
          <IconButton
            className="text-white"
            size="small"
            onClick={() => navigate("/")}
          >
            <CalendarMonthRoundedIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={() => navigate("/stats")}
          >
            <BarChartRoundedIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={() => navigate("/search")}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={() => setSettingsIsOpen(true)}
          >
            <SettingsOutlinedIcon />
          </IconButton>
        </div>
        <Drawer
          anchor="right"
          open={settingsIsOpen}
          onClose={() => setSettingsIsOpen(false)}
          container={() => document.getElementById("app")}
          PaperProps={{
            style: { borderRadius: 0 },
          }}
        >
          <SettingsModal onClose={() => setSettingsIsOpen(false)} />
        </Drawer>
      </TopbarStyled>
    )
  );
};

export default MobileTopbar;
