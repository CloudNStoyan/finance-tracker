import { styled } from "../../infrastructure/ThemeManager";

const ManageCategoriesPageStyled = styled.div`
  max-height: calc(100vh - 50px);
  overflow: hidden;

  .categories-container {
    overflow-y: scroll;
  }
`;

export default ManageCategoriesPageStyled;
