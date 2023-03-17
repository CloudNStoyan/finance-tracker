import { IconButton } from "@mui/material";
import { FunctionComponent } from "react";
import Icons, { IconKey } from "../infrastructure/Icons";
import IconComponentStyled from "./IconComponent.styled";

export interface IconComponentProps {
  iconKey: IconKey;
  idx: number;
  onClick: (iconKey: IconKey, idx: number) => void;
  selected: boolean;
  disabled?: boolean;
}

const IconComponent: FunctionComponent<IconComponentProps> = ({
  iconKey,
  idx,
  onClick,
  selected,
  disabled,
}) => {
  const icon = Icons[iconKey];
  return (
    <IconComponentStyled selected={selected}>
      <IconButton disabled={disabled} onClick={() => onClick(iconKey, idx)}>
        {icon}
      </IconButton>
    </IconComponentStyled>
  );
};

export default IconComponent;
