import React, { FunctionComponent } from "react";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useAppSelector } from "../state/hooks";
import ThemesComponentStyled from "./styles/ThemesComponent.styled";

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
    <ThemesComponentStyled className={`${isDarkMode ? "dark" : ""}`}>
      <StyledThemeProvider theme={styledTheme}>
        <MuiThemeProvider theme={createTheme(muiTheme)}>
          {children}
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ThemesComponentStyled>
  );
};

export default ThemesComponent;
