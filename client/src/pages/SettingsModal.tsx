import {
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Button,
} from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { switchTheme } from "../state/themeSlice";
import SettingsPageStyled from "./styles/SettingsPage.styled";
import LightModeIcon from "@mui/icons-material/LightMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { Close } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";
import { logout } from "../server-api";
import { logoutUser } from "../state/authSlice";
import { useNavigate } from "react-router-dom";

export type SettingsModalProps = {
  onClose: () => void;
};

const SettingsModal: FunctionComponent<SettingsModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);
  const navigate = useNavigate();

  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >((localStorage.getItem("theme_preference") as "light" | "dark") ?? "system");

  useEffect(() => {
    dispatch(switchTheme(selectedTheme));

    if (selectedTheme === "system") {
      localStorage.removeItem("theme_preference");
    } else {
      localStorage.setItem("theme_preference", selectedTheme);
    }
  }, [selectedTheme, dispatch]);

  const onLogout = async () => {
    try {
      const resp = await logout();

      if (resp.status !== 200) {
        return;
      }

      dispatch(logoutUser());
      navigate("/login");
      onClose();
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }
  };

  return (
    <SettingsPageStyled isDarkMode={isDarkMode}>
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
          onChange={(e, v: "light" | "dark" | "system") => setSelectedTheme(v)}
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
        <h2 className="font-bold mb-2">Account</h2>
        <Button
          onClick={() => void onLogout()}
          variant="contained"
          endIcon={<LogoutIcon />}
        >
          Log out
        </Button>
      </div>
    </SettingsPageStyled>
  );
};

export default SettingsModal;
