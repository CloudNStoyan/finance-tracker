import { styled } from "../../infrastructure/ThemeManager";

export type CategoryPageStyledProps = {
  categoryColor: string;
};

const CategoryPageStyled = styled.div<CategoryPageStyledProps>`
  .fields {
    background-color: ${({ categoryColor }) => categoryColor};
    border-radius: 6px;
    transition: background-color 0.15s linear;
  }

  .fields-wrapper {
    border: 10px solid ${({ theme }) => theme.colors.background};
    animation: custom-slide-bottom-up 0.25s;
  }

  .save-btn {
    position: absolute;
    bottom: -20px;
    right: 5px;
    box-shadow: 0 0 10px #333;
  }

  .delete-btn {
    position: absolute;
    bottom: -20px;
    left: 5px;
    box-shadow: 0 0 10px #333;
  }
`;

export default CategoryPageStyled;
