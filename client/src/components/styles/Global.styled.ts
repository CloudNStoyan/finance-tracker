import { createGlobalStyle } from "styled-components";
import { StyledTheme } from "../../infrastructure/ThemeManager";

const GlobalStyles = createGlobalStyle<{ theme: StyledTheme }>`
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  body, #app {
    min-height: 100vh;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default GlobalStyles;
