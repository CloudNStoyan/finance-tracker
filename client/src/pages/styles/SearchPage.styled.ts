import { styled } from "../../infrastructure/ThemeManager";

const SearchPageStyled = styled.div`
  display: flex;
  flex-flow: column;
  max-height: calc(100vh - 50px);

  .transactions-container {
    overflow: hidden;
    overflow-y: scroll;
    padding-bottom: 10px;
    max-width: 100vw;
  }
`;

export default SearchPageStyled;
