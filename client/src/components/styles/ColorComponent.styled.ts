import { styled } from "../../infrastructure/ThemeManager";

export interface ColorStyledProps {
  bgColor: string;
  textColor?: string;
  spinning: boolean;
}

const ColorComponentStyled = styled.div<ColorStyledProps>`
  ${({ spinning }) =>
    spinning
      ? `
      animation-name: custom-spinning-full;
      animation-duration: 5s;
      animation-iteration-count: infinite;
      animation-timing-function: linear;

  `
      : ""}

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
    animation: custom-scale-0-1 0.25s;

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
