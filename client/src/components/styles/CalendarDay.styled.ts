import { styled } from "../../infrastructure/ThemeManager";

const CalendarDayStyled = styled.button<{ isDarkMode: boolean }>`
  -webkit-tap-highlight-color: transparent;
  border-right: 2px solid transparent;
  animation: scale-up-anim 0.25s;

  @keyframes scale-up-anim {
    from {
      transform: scale(0);
    }

    to {
      transform: scale(1);
    }
  }

  &.selected {
    border-color: ${({ theme }) => theme.colors.topbarBg};
  }

  &:not(.selected).today {
    border-color: ${({ isDarkMode }) => (isDarkMode ? "gray" : "#222")};
  }
`;

export default CalendarDayStyled;
