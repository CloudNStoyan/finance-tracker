import { styled } from "../../infrastructure/ThemeManager";

const RegisterPageStyled = styled.div`
  min-height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  ::before {
    content: "";
    position: absolute;
    display: block;
    top: 25px;
    left: 0;
    height: 100%;
    width: 100%;
    background: url(${({ theme }) => theme.svgs.bottomWavesFlipped});
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
  }

  ::after {
    content: "";
    position: absolute;
    display: block;
    bottom: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: url(${({ theme }) => theme.svgs.bottomWaves});
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
  }

  .icon {
    color: ${({ theme }) => theme.colors.accentText};
  }

  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-circle {
    position: absolute;
    z-index: 1;
  }
`;

export default RegisterPageStyled;
