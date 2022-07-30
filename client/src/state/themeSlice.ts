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

const initialState: ThemeState = {
  styledTheme: styledLightTheme,
  muiTheme: muiLightTheme,
  isDarkMode: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    switchTheme(state, action: PayloadAction<"light" | "dark">) {
      if (action.payload === "light") {
        state.styledTheme = styledLightTheme;
        state.muiTheme = muiLightTheme;
        state.isDarkMode = false;
      }

      if (action.payload === "dark") {
        state.styledTheme = styledDarkTheme;
        state.muiTheme = muiDarkTheme;
        state.isDarkMode = true;
      }
    },
  },
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;
