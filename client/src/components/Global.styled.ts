import { createGlobalStyle } from "styled-components";
import { StyledTheme } from "../infrastructure/ThemeManager";

const GlobalStyles = createGlobalStyle<{ theme: StyledTheme }>`
  html {
    height: 100vh;
    height: -webkit-fill-available;
  }

  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
    display: flex;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }

  #app {
    flex-grow: 1;
  }

  // Animations

  @keyframes custom-scale-0-1 {
    from {
      transform: scale(0);
    }

    to {
      transform: scale(1);
    }
  }

  @keyframes custom-slide-bottom-up {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  @keyframes custom-slide-right-left {
    from {
      transform: translateX(100%);
    }

    to {
      transform: translateX(0);
    }
  }

  @keyframes custom-growing-40 {
    0% {
      border-width: 40px;
      outline-width: 5px;
      outline-color: ${({ theme }) => theme.colors.topbarBg};
      opacity: 0;
    }

    25% {
      border-width: 60px;
      outline-width: 30px;
      outline-color: ${({ theme }) => theme.colors.accentText};
      opacity: 1;
    }

    75% {
      border-width: 20px;
      outline-width: 2px;
      outline-color: ${({ theme }) => theme.colors.accentText};
      border-color: ${({ theme }) => theme.colors.accentText};
      background-color: ${({ theme }) => theme.colors.accentText};
      opacity: 1;
    }

    100% {
      border-width: 40px;
      outline-width: 5px;
      outline-color: ${({ theme }) => theme.colors.topbarBg};
      border-color: ${({ theme }) => theme.colors.background};
      background-color: ${({ theme }) => theme.colors.background};
      opacity: 0;
    }
  }

  @keyframes custom-spinning-full {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes custom-shake {
    0% {
        transform: rotate(0deg)
    }

    20% {
        transform: rotate(10deg)
    }

    40% {
        transform: rotate(-10deg);
    }

    60% {
        transform: rotate(10deg);
    }

    80% {
        transform: rotate(-10deg);
    }

    100% {
        transform: rotate(0deg);
    }
}
`;

export default GlobalStyles;
