import { styled } from "../../infrastructure/ThemeManager";

const LoadingStyled = styled.div`
  height: 100%;

  .loading-container {
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation-name: growing-40;
    animation-duration: 1.1s;
    animation-iteration-count: infinite;

    border: 30px solid ${({ theme }) => theme.colors.background};
    outline: 5px solid ${({ theme }) => theme.colors.topbarBg};
  }

  @keyframes growing-40 {
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
`;

export default LoadingStyled;
