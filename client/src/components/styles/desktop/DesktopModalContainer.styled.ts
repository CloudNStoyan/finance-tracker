import { styled } from "../../../infrastructure/ThemeManager";

const DesktopModalContainerStyled = styled.div`
  width: 350px;
  overflow: hidden;
  background-color: transparent;

  > * {
    animation: custom-slide-right-left 0.25s;
    background-color: white;
    padding-top: 10px;
  }
`;

export default DesktopModalContainerStyled;
