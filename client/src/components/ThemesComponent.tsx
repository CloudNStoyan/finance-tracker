import { FunctionComponent, ReactNode } from "react";
import styled, {
  ThemeProvider as StyledThemeProvider,
} from "styled-components";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useAppSelector } from "../state/hooks";

const ThemesComponentStyled = styled.div`
  padding-top: 50px;
  height: 100%;

  @media (min-width: 1024px) {
    padding-top: 60px;
  }
`;

export interface ThemesComponentProps {
  children: ReactNode[] | ReactNode;
}

const ThemesComponent: FunctionComponent<ThemesComponentProps> = ({
  children,
}) => {
  const { styledTheme, muiTheme, isDarkMode } = useAppSelector(
    (state) => state.themeReducer
  );

  return (
    <ThemesComponentStyled
      id="wrapper"
      className={`${isDarkMode ? "dark" : ""}`}
    >
      <StyledThemeProvider theme={styledTheme}>
        <MuiThemeProvider theme={createTheme(muiTheme)}>
          {children}
        </MuiThemeProvider>
      </StyledThemeProvider>
    </ThemesComponentStyled>
  );
};

export default ThemesComponent;
