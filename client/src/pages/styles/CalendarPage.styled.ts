import { styled } from "../../infrastructure/ThemeManager";

const CalendarPageStyled = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f3f4f6")};
  max-height: calc(100vh - 50px);

  .calendar-container {
    background-color: ${({ theme }) => theme.colors.background};
  }

  .calendar-wrapper {
    display: flex;
    flex-flow: row wrap;
    padding: 10px;

    > * {
      flex: 14%;
    }
  }
`;

export default CalendarPageStyled;
