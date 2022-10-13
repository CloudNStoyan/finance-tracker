import { styled } from "../../infrastructure/ThemeManager";

const StatisticsPageStyled = styled.div`
  display: flex;
  max-height: calc(100vh - 50px);
  flex-flow: column nowrap;

  .transaction-list {
    overflow: hidden;
    overflow-y: scroll;
    margin: 10px 0;
    max-width: 100vw;
  }

  .categories-list {
    max-width: 100vw;
  }

  .chart {
    flex: 0 0 250px;
    box-shadow: 0 6px 7px rgb(0 0 0 / 5%);
    padding-bottom: 20px;
  }
`;

export default StatisticsPageStyled;
