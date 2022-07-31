import { createGlobalStyle } from "styled-components";
import { StyledTheme } from "../../infrastructure/ThemeManager";

const GlobalStyles = createGlobalStyle<{ theme: StyledTheme }>`
  html {
  height: -webkit-fill-available;
  }
  body {
    min-height: -webkit-fill-available;
    display: flex;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  #app {
    flex-grow: 1;
  }
`;

export default GlobalStyles;
