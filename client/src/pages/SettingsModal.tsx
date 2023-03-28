import {
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { switchTheme } from "../state/themeSlice";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Close } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { logout } from "../server-api";
import { logoutUser } from "../state/authSlice";
import { useNavigate } from "react-router-dom";
import { setFirstDayOfTheMonth } from "../state/calendarSlice";
import { setNotification } from "../state/notificationSlice";
import { styled } from "../infrastructure/ThemeManager";

export interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModalStyled = styled.div<{ isDarkMode: boolean }>`
  width: 320px;

  .heading {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid;
    border-bottom-color: ${({ isDarkMode }) =>
      isDarkMode ? "#444" : "#e9e9e9"};

    h1 {
      font-size: 20px;
    }

    margin-bottom: 20px;
  }

  .container {
    padding: 10px;
  }
`;

const SettingsModal: FunctionComponent<SettingsModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >((localStorage.getItem("theme_preference") as "light" | "dark") ?? "system");
  const firstDayOfTheMonth = useAppSelector(
    (state) => state.calendarReducer.firstDayOfTheMonth
  );

  useEffect(() => {
    dispatch(switchTheme(selectedTheme));

    if (selectedTheme === "system") {
      localStorage.removeItem("theme_preference");
    } else {
      localStorage.setItem("theme_preference", selectedTheme);
    }
  }, [selectedTheme, dispatch]);

  useEffect(() => {
    localStorage.setItem("first_day_of_month_preference", firstDayOfTheMonth);
  }, [firstDayOfTheMonth]);

  const onLogout = async () => {
    setIsLoggingOut(true);
    try {
      const httpResponse = await logout();

      if (httpResponse.status !== 200) {
        return;
      }

      dispatch(logoutUser());
      navigate("/login");
      onClose();
    } catch (error) {
      dispatch(setNotification({ message: "General error!", color: "error" }));
      if (!axios.isAxiosError(error)) {
        return;
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SettingsModalStyled isDarkMode={isDarkMode}>
      <div className="heading">
        <h1>Settings</h1>
        <IconButton onClick={onClose}>
          <Close color="primary" />
        </IconButton>
      </div>
      <div className="container">
        <h2 className="mb-2 font-bold">Mode</h2>
        <ToggleButtonGroup
          color="primary"
          exclusive
          value={selectedTheme}
          onChange={(e, v: "light" | "dark" | "system") => {
            if (v === null) {
              return;
            }

            setSelectedTheme(v);
          }}
          className="w-full justify-center"
        >
          <ToggleButton value="light">
            <LightModeIcon className="mr-1" />
            <span>Light</span>
          </ToggleButton>
          <ToggleButton value="system">
            <SettingsBrightnessIcon className="mr-1" />
            <span>System</span>
          </ToggleButton>
          <ToggleButton value="dark">
            <DarkModeIcon className="mr-1" />
            <span>Dark</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="container">
        <h2 className="mb-2 font-bold">First Day Of The Week</h2>
        <ToggleButtonGroup
          color="primary"
          exclusive
          value={firstDayOfTheMonth}
          onChange={(e, v: "monday" | "sunday") => {
            if (v === null) {
              return;
            }

            dispatch(setFirstDayOfTheMonth(v));
          }}
          className="w-full justify-center"
        >
          <ToggleButton value="monday">
            <span>Monday</span>
          </ToggleButton>
          <ToggleButton value="sunday">
            <span>Sunday</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className="container">
        <h2 className="font-bold mb-2">Account</h2>
        <Button
          onClick={() => void onLogout()}
          variant="contained"
          endIcon={
            isLoggingOut ? (
              <CircularProgress size={16} className="text-white" />
            ) : (
              <LogoutIcon />
            )
          }
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out" : "Log out"}
        </Button>
      </div>
    </SettingsModalStyled>
  );
};

export default SettingsModal;
