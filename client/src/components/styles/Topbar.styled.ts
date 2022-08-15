import { styled } from "../../infrastructure/ThemeManager";

const TopbarStyled = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.topbarBg};
  height: 50px;

  .MuiSwitch-root {
    z-index: 100;
  }
`;

export default TopbarStyled;
