import React, { FunctionComponent } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useAppSelector } from "../state/hooks";

export type ThemesComponentProps = {
  children: React.ReactNode[] | React.ReactNode;
};

const ThemesComponent: FunctionComponent<ThemesComponentProps> = ({
  children,
}) => {
  const { styledTheme, muiTheme, isDarkMode } = useAppSelector(
    (state) => state.themeReducer
  );

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <StyledThemeProvider theme={styledTheme}>
        <MuiThemeProvider theme={createTheme(muiTheme)}>
          {children}
        </MuiThemeProvider>
      </StyledThemeProvider>
    </div>
  );
};

export default ThemesComponent;
