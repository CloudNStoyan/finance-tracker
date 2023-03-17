import { styled } from "../../infrastructure/ThemeManager";

interface DesktopLandingPageStyledProps {
  isDarkMode: boolean;
}

const DesktopLandingPageStyled = styled.div<DesktopLandingPageStyledProps>`
  @keyframes mobile-device-animation {
    from {
      transform: translateY(-2px) rotate3d(1, 1, 1, 5deg) scale(0.8);
    }
    to {
      transform: translateY(2px) rotate3d(1, 1, 1, 5deg) scale(0.8);
    }
  }

  @keyframes desktop-device-animation {
    from {
      transform: translateY(-2px) scale(0.8);
    }
    to {
      transform: translateY(2px) scale(0.8);
    }
  }

  @media (prefers-reduced-motion) {
    .mobile-device,
    .desktop-device {
      animation: none !important;
    }
  }

  .mobile-device {
    animation: mobile-device-animation 1s linear infinite alternate;
    height: 400px;
    transform: rotate3d(1, 1, 1, 5deg) scale(0.8);
    z-index: 1;
  }

  .desktop-device {
    animation: desktop-device-animation 1s linear infinite alternate;
    animation-delay: 0.5s;
    height: 400px;
    transform: scale(0.8);
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

  main {
    max-width: 1400px;
    margin: 0 auto;
    margin-top: 50px;
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

export default DesktopLandingPageStyled;
