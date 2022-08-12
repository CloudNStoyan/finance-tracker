import { styled } from "../../../infrastructure/ThemeManager";

const DesktopPickCategoriesStyled = styled.div`
  .cats {
    display: flex;
    flex-flow: column;
    gap: 5px;
    padding: 10px;
    min-width: 300px;
    max-height: 300px;
    overflow: hidden;
    overflow-y: scroll;
    margin: 5px;

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
`;

export default DesktopPickCategoriesStyled;
