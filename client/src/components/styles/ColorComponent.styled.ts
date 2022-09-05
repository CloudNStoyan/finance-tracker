import { styled } from "../../infrastructure/ThemeManager";

export type ColorStyledProps = {
  bgColor: string;
  textColor?: string;
};

const ColorComponentStyled = styled.div<ColorStyledProps>`
  button {
    background-color: ${({ bgColor }) => bgColor};
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s linear;

    ::after {
      content: "";
      display: block;
      ${({ textColor }) =>
        textColor ? `background-color: ${textColor};` : ""};
      border-radius: 50%;
    }
  }
`;

export default ColorComponentStyled;
