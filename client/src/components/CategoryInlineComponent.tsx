import { FunctionComponent } from "react";
import { Category } from "../server-api";
import Icons from "../infrastructure/Icons";
import { IconButton } from "@mui/material";
import CategoryInlineComponentStyled from "./CategoryInlineComponent.styled";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

export interface CategoryInlineComponentProps {
  category: Category;
}

const CategoryInlineComponent: FunctionComponent<
  CategoryInlineComponentProps
> = ({ category }) => {
  const navigate = useNavigate();

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
        onClick={() => navigate(`/category/${category.categoryId}`)}
      >
        <EditIcon />
      </IconButton>
    </CategoryInlineComponentStyled>
  );
};

export default CategoryInlineComponent;
