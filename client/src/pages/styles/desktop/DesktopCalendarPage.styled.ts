import { styled } from "../../../infrastructure/ThemeManager";

const DesktopCalendarPageStyled = styled.div<{
  hasSixRows: boolean;
  isDarkMode: boolean;
}>`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};

  .calendar-wrapper {
    display: flex;
    padding: 10px;
    margin: 0 auto;
    height: 100%;
    max-height: 100%;
    flex-flow: row wrap;
    align-content: flex-start;
    justify-content: center;

    .today {
      .action-bar {
        background-color: ${({ theme }) => theme.colors.accentText};
      }
    }

    .days-of-week {
      flex: 100%;
      height: fit-content;
      min-height: fit-content;
      background-color: ${({ theme }) => theme.colors.background};
      text-align: center;
    }

    > * {
      min-width: 100px;
      flex: 0 0 14%;
      height: ${({ hasSixRows }) => (hasSixRows ? "16%" : "19%")};
      min-height: 125px;

      :not(.days-of-week) {
        padding: 5px;
      }
    }

    .action-bar {
      background-color: ${({ isDarkMode }) =>
        isDarkMode ? "#222" : "#f4f4f4"};
    }
  }
`;

export default DesktopCalendarPageStyled;
