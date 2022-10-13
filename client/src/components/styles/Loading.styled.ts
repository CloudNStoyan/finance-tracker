import { styled } from "../../infrastructure/ThemeManager";

const LoadingStyled = styled.div`
  height: 100%;

  .loading-container {
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation-name: custom-growing-40;
    animation-duration: 1.1s;
    animation-iteration-count: infinite;

    border: 30px solid ${({ theme }) => theme.colors.background};
    outline: 5px solid ${({ theme }) => theme.colors.topbarBg};
  }
`;

export default LoadingStyled;
