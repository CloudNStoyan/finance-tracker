import { styled } from "../../infrastructure/ThemeManager";

const VerifyEmailPageStyled = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading {
    * {
      opacity: 0.75;
    }
  }

  form {
    width: 320px;
    background-color: transparent;
  }

  h1 {
    font-size: 24px;
    text-align: center;
    font-weight: 600;
    color: #333;
  }

  h2 {
    font-size: 20px;
    text-align: center;
    font-weight: 600;
    color: #333;
  }

  p {
    text-align: center;
  }

  input {
    width: 210px;
    text-align: center;
    letter-spacing: 15px;
    text-indent: 15px;
    margin: 0 auto;
  }

  .loading-circle {
    position: absolute;
    z-index: 1;
  }

  ::before {
    content: "";
    position: absolute;
    display: block;
    top: 0;
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
`;

export default VerifyEmailPageStyled;
