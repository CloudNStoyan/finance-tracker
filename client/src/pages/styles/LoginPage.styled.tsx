import { styled } from "../../infrastructure/ThemeManager";

const LoginPageStyled = styled.div`
  min-height: 100vh;
  background: url(${({ theme }) => theme.svgs.bottomWavesFlipped});
  background-repeat: no-repeat;
  background-size: cover;
  background-position-y: -25px;

  display: flex;
  justify-content: center;
  align-items: center;

  .icon {
    color: ${({ theme }) => theme.colors.accentText};
  }

  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    background: url(${({ theme }) => theme.svgs.bottomWaves});
    background-repeat: no-repeat;
    background-size: cover;
  }

  .loading-circle {
    position: absolute;
    z-index: 1;
  }
`;

export default LoginPageStyled;
