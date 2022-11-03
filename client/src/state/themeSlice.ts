import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  muiLightTheme,
  styledLightTheme,
  muiDarkTheme,
  styledDarkTheme,
  StyledTheme,
} from "../infrastructure/ThemeManager";

export interface ThemeState {
  styledTheme: StyledTheme;
  muiTheme: typeof muiDarkTheme | typeof muiLightTheme;
  isDarkMode: boolean;
}

const getSystemPrefColorScheme = () => {
  const prefDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  return prefDarkMode ? "dark" : "light";
};

const getInitState = () => {
  const themePref =
    localStorage.getItem("theme_preference") ?? getSystemPrefColorScheme();

  if (themePref === "dark") {
    return {
      styledTheme: styledDarkTheme,
      muiTheme: muiDarkTheme,
      isDarkMode: true,
    };
  }

  return {
    styledTheme: styledLightTheme,
    muiTheme: muiLightTheme,
    isDarkMode: false,
  };
};

const initialState: ThemeState = getInitState();

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    switchTheme(state, action: PayloadAction<"light" | "dark" | "system">) {
      const mode =
        action.payload === "system"
          ? getSystemPrefColorScheme()
          : action.payload;

      if (mode === "light") {
        state.styledTheme = styledLightTheme;
        state.muiTheme = muiLightTheme;
        state.isDarkMode = false;
      }

      if (mode === "dark") {
        state.styledTheme = styledDarkTheme;
        state.muiTheme = muiDarkTheme;
        state.isDarkMode = true;
      }
    },
  },
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;
