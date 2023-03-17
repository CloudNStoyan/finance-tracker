import { styled } from "../infrastructure/ThemeManager";

interface LandingPageStyledProps {
  isDarkMode: boolean;
}

const LandingPageStyled = styled.div<LandingPageStyledProps>`
  @keyframes mobile-device-animation {
    from {
      transform: translateY(-2px) rotate3d(1, 1, 1, 5deg);
    }
    to {
      transform: translateY(2px) rotate3d(1, 1, 1, 5deg);
    }
  }

  @keyframes desktop-device-animation {
    from {
      transform: translateY(-2px);
    }
    to {
      transform: translateY(2px);
    }
  }

  @keyframes hamburger-menu-animation {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion) {
    .mobile-device,
    .desktop-device {
      animation: none !important;
    }

    @keyframes hamburger-menu-animation-reduced-motion {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .navbar-menu {
      > * {
        animation: hamburger-menu-animation-reduced-motion 0.5s
          cubic-bezier(0.075, 0.82, 0.165, 1) 0s 1 !important;
      }
    }
  }

  .mobile-device {
    animation: mobile-device-animation 1s linear infinite alternate;
    max-width: 300px;
    transform: rotate3d(1, 1, 1, 5deg);
    z-index: 1;
    max-height: 300px;

    img {
      object-fit: scale-down;
      aspect-ratio: f;
    }
  }

  .desktop-device {
    animation: desktop-device-animation 1s linear infinite alternate;
    animation-delay: 0.5s;
    width: 300px;
  }

  .navbar {
    height: 60px;
    width: 100%;
    display: flex;
    justify-content: center;
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#222" : "#f9f9f9")};

    h1 {
      font-size: 1.5rem;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
  }

  .navbar-menu {
    top: 60px;
    height: 100%;
    position: fixed;
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#333" : "#f9f9f9")};
    width: 100%;
    z-index: 100;

    > * {
      animation: hamburger-menu-animation 0.5s
        cubic-bezier(0.075, 0.82, 0.165, 1) 0s 1;
    }
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    margin-top: 25px;
    background-color: ${({ theme }) => theme.colors.background};
  }

  p {
    margin: 0 auto;
    max-width: 1024px;
    text-align: center;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0;
  }

  h1,
  h2,
  h3 {
    text-align: center;
  }
`;

export default LandingPageStyled;
