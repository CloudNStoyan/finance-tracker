import { styled } from "../../infrastructure/ThemeManager";

const DesktopStatisticsPageStyled = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  max-height: calc(100vh - 50px);
  height: 100%;
  flex-flow: column nowrap;

  .transaction-list {
    overflow: hidden;
    overflow-y: scroll;
    margin: 10px 0;

    &::-webkit-scrollbar {
      width: 0.4em;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.scrollBar};
      border-radius: 6px;
    }
  }

  .nav-wrapper {
    border-bottom: 2px solid
      ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};

    .nav {
      border: 2px solid ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};
      margin-bottom: 0;
      border-bottom: 0;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }
  }

  .categories-list {
    max-width: 100vw;
  }

  .charts-container {
    display: flex;
    overflow: hidden;
    margin: 10px 0;
    height: 100%;
    margin-top: 20px;
  }

  .chart-wrapper {
    height: 100%;
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
  }

  .splitter {
    height: 100%;
    width: 2px;
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};
  }

  .chart {
    box-shadow: 0 6px 7px rgb(0 0 0 / 5%);
    padding-bottom: 20px;
    height: 300px;
  }
`;

export default DesktopStatisticsPageStyled;
