import { styled } from "../../../infrastructure/ThemeManager";

const DesktopModalContainerStyled = styled.div`
  width: 350px;
  overflow: hidden;
  background-color: transparent;

  > * {
    animation-name: side-animation;
    animation-duration: 0.25s;
    background-color: white;
    padding-top: 10px;
  }

  @keyframes side-animation {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

export default DesktopModalContainerStyled;
