import { IconButton } from "@mui/material";
import { FunctionComponent } from "react";
import Icons, { IconKey } from "../infrastructure/Icons";
import IconComponentStyled from "./styles/IconComponent.styled";

export type IconComponentProps = {
  iconKey: IconKey;
  idx: number;
  onClick: (iconKey: IconKey, idx: number) => void;
  selected: boolean;
};

const IconComponent: FunctionComponent<IconComponentProps> = ({
  iconKey,
  idx,
  onClick,
  selected,
}) => {
  const icon = Icons[iconKey];
  return (
    <IconComponentStyled selected={selected}>
      <IconButton onClick={() => onClick(iconKey, idx)}>{icon}</IconButton>
    </IconComponentStyled>
  );
};

export default IconComponent;
