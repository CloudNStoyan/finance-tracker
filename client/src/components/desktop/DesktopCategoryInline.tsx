import { FunctionComponent } from "react";
import { Category } from "../../server-api";
import Icons from "../../infrastructure/Icons";
import { IconButton } from "@mui/material";
import CategoryInlineComponentStyled from ".././styles/CategoryInlineComponent.styled";
import EditIcon from "@mui/icons-material/Edit";

export type DesktopCategoryInlineComponentProps = {
  category: Category;
  onSelected: (cat: Category) => void;
};

const DesktopCategoryInlineComponent: FunctionComponent<
  DesktopCategoryInlineComponentProps
> = ({ category, onSelected }) => {
  return (
    <CategoryInlineComponentStyled
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
    </CategoryInlineComponentStyled>
  );
};

export default DesktopCategoryInlineComponent;
