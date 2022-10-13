import { styled } from "../../../infrastructure/ThemeManager";

export type DesktopStatsTransactionStyledProps = {
  bgColor: string;
  isDarkMode: boolean;
};

const DesktopStatsTransactionStyled = styled.div<DesktopStatsTransactionStyledProps>`
  animation: custom-scale-0-1 0.25s;

  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};

  .cats {
    background-color: ${({ bgColor }) => bgColor};
    display: flex;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
  }
`;

export default DesktopStatsTransactionStyled;
