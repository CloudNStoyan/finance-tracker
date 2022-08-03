import { styled } from "../../infrastructure/ThemeManager";

export type CategoryPageStyledProps = {
  categoryColor: string;
};

const CategoryPageStyled = styled.div<CategoryPageStyledProps>`
  .fields {
    background-color: ${({ categoryColor }) => categoryColor};
    border-radius: 6px;
  }

  .fields-wrapper {
    border: 10px solid ${({ theme }) => theme.colors.background};
  }

  .save-btn {
    position: absolute;
    bottom: -20px;
    right: 5px;
    box-shadow: 0 0 10px #333;
  }
`;

export default CategoryPageStyled;
