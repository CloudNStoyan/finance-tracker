import { IconButton } from "@mui/material";
import { FunctionComponent } from "react";
import Icons, { IconKey } from "../infrastructure/Icons";
import { styled } from "../infrastructure/ThemeManager";

const IconComponentStyled = styled.div<{ selected: boolean }>`
  button {
    border: 2px solid ${({ theme }) => theme.colors.text};
    animation: custom-scale-0-1 0.25s;

    ${({ selected, theme }) =>
      selected
        ? `
        background-color: ${theme.colors.topbarBg}!important; 
        color: white; 
        border-color: white;
        transform: scale(1.3);
        transition: transform 0.15s linear;
        `
        : ""}
  }
`;

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
  const onIconClick = () => {
    onClick(iconKey, idx);
  };
  return (
    <IconComponentStyled selected={selected}>
      <IconButton disabled={disabled} onClick={onIconClick}>
        {icon}
      </IconButton>
    </IconComponentStyled>
  );
};

export default IconComponent;
