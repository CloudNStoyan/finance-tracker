import { styled } from "../../infrastructure/ThemeManager";

const DesktopLoginPageStyled = styled.div`
  min-height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  form {
    background-color: ${({ theme }) => theme.colors.background};
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

    &.shake-errors {
      .MuiFormHelperText-root.Mui-error {
        width: fit-content;
        animation: custom-shake 0.25s linear;
      }
    }
  }

  .loading {
    * {
      opacity: 0.75;
    }
  }

  ::before {
    content: "";
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: url(${({ theme }) => theme.svgs.bgSteps});
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

export default DesktopLoginPageStyled;
