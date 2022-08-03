import { styled } from "../../infrastructure/ThemeManager";

type Props = {
  bgColor: string;
};

const CategoryInlineComponentStyled = styled.div<Props>`
  background-color: ${({ bgColor }) => bgColor};
`;

export default CategoryInlineComponentStyled;
