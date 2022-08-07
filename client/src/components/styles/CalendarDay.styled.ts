import { styled } from "../../infrastructure/ThemeManager";

const CalendarDayStyled = styled.button`
  -webkit-tap-highlight-color: transparent;
  border-right: 2px solid transparent;

  &.selected {
    border-color: ${({ theme }) => theme.colors.topbarBg};
  }

  &:not(.selected).today {
    border-color: black;
  }
`;

export default CalendarDayStyled;
