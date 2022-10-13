import { styled } from "../../../infrastructure/ThemeManager";

const DesktopTopbarStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.topbarBg};
  height: 60px;

  .MuiSwitch-root {
    z-index: 100;
  }
`;

export default DesktopTopbarStyled;
