import { Add, Settings, West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { FunctionComponent, useMemo } from "react";
import { Category } from "../../server-api";
import DesktopPickCategoriesStyled from "./DesktopPickCategories.styled";
import PickCategoryStyled from "../PickCategory.styled";
import DefaultCategory from "../../state/DefaultCategory";
import Icons from "../../infrastructure/Icons";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setTransactionCategory } from "../../state/addOrEditTransactionSlice";

export interface DesktopPickCategoriesModalProps {
  onClose: () => void;
  onSettings: () => void;
  onAddCategory: () => void;
}

const DesktopCategoryPick: FunctionComponent<{
  category: Category;
  onClose: () => void;
}> = ({ category }) => {
  const dispatch = useAppDispatch();
  const onClick = () => {
    dispatch(setTransactionCategory(category));
  };
  return (
    <PickCategoryStyled bgColor={category.bgColor}>
      <button className="wrapper" onClick={onClick}>
        <div className="icon">{Icons[category.icon]}</div>
        <h4>{category.name}</h4>
      </button>
    </PickCategoryStyled>
  );
};

const DesktopPickCategoriesModal: FunctionComponent<
  DesktopPickCategoriesModalProps
> = ({ onClose, onSettings, onAddCategory }) => {
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const categoriesWithDefault = useMemo(
    () => [...categories, DefaultCategory],
    [categories]
  );

  return (
    <DesktopPickCategoriesStyled>
      <div className="flex items-center justify-between mx-2 mt-1">
        <IconButton onClick={onClose}>
          <West />
        </IconButton>
        <h2 className="font-medium">Select Category</h2>
        <IconButton onClick={onSettings}>
          <Settings />
        </IconButton>
      </div>
      <div className="cats">
        {categoriesWithDefault.map((cat) => (
          <DesktopCategoryPick
            category={cat}
            key={cat.categoryId}
            onClose={onClose}
          />
        ))}
      </div>
      <Button onClick={onAddCategory} className="ml-3 mb-1" startIcon={<Add />}>
        Add Category
      </Button>
    </DesktopPickCategoriesStyled>
  );
};

export default DesktopPickCategoriesModal;
