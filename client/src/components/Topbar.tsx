import { Drawer, IconButton, useMediaQuery } from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAppSelector } from "../state/hooks";
import TopbarStyled from "./styles/Topbar.styled";
import WestIcon from "@mui/icons-material/West";
import { useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsModal from "../pages/SettingsModal";
import { RemoveDuplicates } from "../infrastructure/Utils";

const Topbar: FunctionComponent = () => {
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector((state) => state.authReducer.isLoggedIn);

  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const location = useLocation();

  const [history, setHistory] = useState<string[]>(["/"]);

  const isDesktop = useMediaQuery("(min-width:1024px)");

  const canGoBack = history.length > 1;

  const navigateBack = () => {
    if (history.length > 0) {
      navigate(history[1]);
      history.shift();
      setHistory(history);
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      setHistory([location.pathname]);
      return;
    }

    setHistory(RemoveDuplicates([location.pathname, ...history]));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    isLoggedIn && (
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
          {!isDesktop && (
            <IconButton
              className="text-white"
              size="small"
              onClick={() => navigate("/search")}
            >
              <SearchIcon />
            </IconButton>
          )}
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

export default Topbar;
