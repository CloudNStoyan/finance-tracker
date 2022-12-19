import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  IconButton,
  styled,
} from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useAppSelector } from "../../state/hooks";
import { useNavigate } from "react-router-dom";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SettingsModal from "../../pages/SettingsModal";
import DesktopTopbarStyled from "../styles/desktop/DesktopTopbar.styled";
import DesktopCalendarSearch from "./DesktopCalendarSearch";

const CustomBottomNavigation = styled(BottomNavigation)({
  backgroundColor: "transparent",
  "& .MuiBottomNavigationAction-root": {
    opacity: "0.7!important",
    color: "white!important",
  },
  "& .Mui-selected": {
    opacity: "1!important",
  },
});

const DesktopTopbar: FunctionComponent = () => {
  const navigate = useNavigate();

  const { isLoggedIn, user } = useAppSelector((state) => state.authReducer);

  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  return (
    isLoggedIn &&
    user.activated && (
      <DesktopTopbarStyled className="flex justify-between items-center py-2">
        <CustomBottomNavigation
          showLabels
          value={window.location.pathname}
          onChange={(e, newValue: string) => {
            navigate(newValue);
          }}
        >
          <BottomNavigationAction
            value="/"
            label="Calendar"
            icon={<CalendarMonthRoundedIcon fontSize="medium" />}
          />
          <BottomNavigationAction
            value="/stats"
            label="Statistics"
            icon={<BarChartRoundedIcon fontSize="medium" />}
          />
        </CustomBottomNavigation>
        <div className="flex text-white">
          <DesktopCalendarSearch />
          <IconButton
            className="text-white"
            size="medium"
            onClick={() => setSettingsIsOpen(true)}
          >
            <SettingsOutlinedIcon fontSize="medium" />
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
      </DesktopTopbarStyled>
    )
  );
};

export default DesktopTopbar;
