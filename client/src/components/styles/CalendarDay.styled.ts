import { styled } from "../../infrastructure/ThemeManager";

const CalendarDayStyled = styled.button<{ isDarkMode: boolean }>`
  -webkit-tap-highlight-color: transparent;
  border-right: 2px solid transparent;

  &.selected {
    border-color: ${({ theme }) => theme.colors.topbarBg};
  }

  &:not(.selected).today {
    border-color: ${({ isDarkMode }) => (isDarkMode ? "gray" : "#222")};
  }
`;

export default CalendarDayStyled;
