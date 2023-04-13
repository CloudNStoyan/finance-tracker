import { Drawer, IconButton } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useAppSelector } from "../state/hooks";
import WestIcon from "@mui/icons-material/West";
import { useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsModal from "../pages/SettingsModal";
import { styled } from "../infrastructure/ThemeManager";

const TopbarStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.topbarBg};
  height: 50px;

  .MuiSwitch-root {
    z-index: 100;
  }
`;

const navigateBackMap: { [key: string]: string } = {
  "/category": "/categories",
};

const MobileTopbar: FunctionComponent = () => {
  const navigate = useNavigate();

  const { isLoggedIn, user } = useAppSelector((state) => state.authReducer);

  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const { pathname } = useLocation();

  const navigateToHome = () => {
    navigate("/");
  };

  const canGoBack = pathname !== "/";

  const navigateBack = () => {
    if (!canGoBack) {
      return;
    }

    if (!("/" + pathname.split("/")[1] in navigateBackMap)) {
      navigateToHome();
    }

    navigate(navigateBackMap[pathname]);
  };

  const navigateToSearch = () => {
    navigate("/search");
  };

  const navigateToStats = () => {
    navigate("/stats");
  };

  const openSettingsModal = () => {
    setSettingsIsOpen(true);
  };

  const closeSettingsModal = () => {
    setSettingsIsOpen(false);
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
            onClick={navigateBack}
          >
            <WestIcon />
          </IconButton>
        )}

        <div>
          <IconButton
            className="text-white"
            size="small"
            onClick={navigateToHome}
          >
            <CalendarMonthRoundedIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={navigateToStats}
          >
            <BarChartRoundedIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={navigateToSearch}
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            className="text-white"
            size="small"
            onClick={openSettingsModal}
          >
            <SettingsOutlinedIcon />
          </IconButton>
        </div>
        <Drawer
          anchor="right"
          open={settingsIsOpen}
          onClose={closeSettingsModal}
          container={document.getElementById("app")}
          PaperProps={{
            style: { borderRadius: 0 },
          }}
        >
          <SettingsModal onClose={closeSettingsModal} />
        </Drawer>
      </TopbarStyled>
    )
  );
};

export default MobileTopbar;
