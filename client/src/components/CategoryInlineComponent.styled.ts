import { styled } from "../infrastructure/ThemeManager";

type Props = {
  bgColor: string;
};

const CategoryInlineComponentStyled = styled.div<Props>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;
`;

export default CategoryInlineComponentStyled;
