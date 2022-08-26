import { styled } from "../../infrastructure/ThemeManager";

const PickCategoriesStyled = styled.div`
  display: flex;
  flex-flow: column;
  height: 100vh;

  .cat-wrapper {
    flex-grow: 1;
    max-height: calc(100vh - 50px);
    padding: 10px;
    display: flex;
    flex-flow: column;

    .cat-container {
      display: flex;
      flex-flow: column;
      gap: 5px;
      overflow: hidden;
      overflow-y: scroll;
      height: 100%;
    }

    .manage-cat-btn {
      margin-top: 10px;
    }
  }
`;

export default PickCategoriesStyled;
