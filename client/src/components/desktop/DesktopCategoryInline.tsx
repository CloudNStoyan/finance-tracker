import { FunctionComponent } from "react";
import { Category } from "../../server-api";
import Icons from "../../infrastructure/Icons";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { styled } from "../../infrastructure/ThemeManager";

export interface DesktopCategoryInlineComponentProps {
  category: Category;
  onSelected: (cat: Category) => void;
}

const DesktopCategoryInlineComponentStyled = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;
`;

const DesktopCategoryInlineComponent: FunctionComponent<
  DesktopCategoryInlineComponentProps
> = ({ category, onSelected }) => {
  return (
    <DesktopCategoryInlineComponentStyled
      bgColor={category.bgColor}
      className="
      flex flex-nowrap items-center wrapper p-3
      rounded justify-between text-white dark:text-gray-300 shadow-lg"
    >
      <div className="flex flex-nowrap items-center text-white dark:text-gray-300">
        {Icons[category.icon]}
        <div className="ml-2 font-bold">{category.name}</div>
      </div>
      <IconButton
        size="small"
        className="text-white dark:text-gray-300 p-0"
        onClick={() => onSelected(category)}
      >
        <EditIcon />
      </IconButton>
    </DesktopCategoryInlineComponentStyled>
  );
};

export default DesktopCategoryInlineComponent;
