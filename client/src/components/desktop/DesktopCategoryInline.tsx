import React, { FunctionComponent } from "react";
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
      flex flex-nowrap items-center wrapper m-2 
      rounded p-2 justify-between text-white dark:text-gray-300 shadow-lg"
    >
      <div className="flex flex-nowrap items-center">
        <IconButton
          size="small"
          className="text-white dark:text-gray-300 border-dashed border-white border-2"
        >
          {Icons[category.icon]}
        </IconButton>
        <div className="ml-2 font-bold">{category.name}</div>
      </div>
      <IconButton
        className="text-white dark:text-gray-300"
        onClick={() => onSelected(category)}
      >
        <EditIcon />
      </IconButton>
    </CategoryInlineComponentStyled>
  );
};

export default DesktopCategoryInlineComponent;
