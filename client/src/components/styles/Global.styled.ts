import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap');
  @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

  body, #app {
    min-height: 100vh;
  }
`;

export default GlobalStyles;
