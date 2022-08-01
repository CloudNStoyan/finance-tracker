import { styled } from "../../infrastructure/ThemeManager";

export type CategoryPageStyledProps = {
  categoryColor: string;
};

const CategoryPageStyled = styled.div<CategoryPageStyledProps>`
  .fields {
    background-color: ${({ categoryColor }) => categoryColor};
  }

  .save-btn {
    position: absolute;
    bottom: -20px;
    right: 5px;
  }
`;

export default CategoryPageStyled;
