import React, { FunctionComponent } from "react";
import ColorComponentStyled from "./styles/ColorComponent.styled";

export type ColorProps = {
  bgColor: string;
  textColor?: string;
  idx: number;
  onClick: (bgColor: string, idx: number) => void;
  selected: boolean;
};

const ColorComponent: FunctionComponent<ColorProps> = ({
  bgColor,
  textColor,
  onClick,
  selected,
  idx,
}) => {
  return (
    <ColorComponentStyled
      bgColor={bgColor}
      textColor={textColor}
      spinning={selected}
    >
      <button
        className={`${
          selected
            ? "border-2 border-black dark:border-white border-dashed scale-125"
            : ""
        }`}
        onClick={() => onClick(bgColor, idx)}
      ></button>
    </ColorComponentStyled>
  );
};

export default ColorComponent;
