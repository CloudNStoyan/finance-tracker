import { Add, West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import React, { FunctionComponent } from "react";
import { Category } from "../../server-api";
import { useAppSelector } from "../../state/hooks";
import DesktopManageCategoriesStlyed from "../styles/desktop/DesktopManageCategories.styled";
import DesktopCategoryInlineComponent from "./DesktopCategoryInline";

export type DesktopManageCategoriesModalProps = {
  onClose: () => void;
  selectedCat: (cat: Category) => void;
  onAddCategory: () => void;
};

const DesktopManageCategoriesModal: FunctionComponent<
  DesktopManageCategoriesModalProps
> = ({ onClose, selectedCat, onAddCategory }) => {
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  return (
    <DesktopManageCategoriesStlyed>
      <div className="flex items-center justify-start mx-2 mt-1">
        <IconButton onClick={() => onClose()}>
          <West />
        </IconButton>
        <h2 className="grow text-center font-medium">Manage Categories</h2>
      </div>
      <div className="cats">
        {categories.map((cat) => (
          <DesktopCategoryInlineComponent
            onSelected={selectedCat}
            category={cat}
            key={cat.categoryId}
          />
        ))}
      </div>
      <Button onClick={onAddCategory} className="ml-3 mb-1" startIcon={<Add />}>
        Add Category
      </Button>
    </DesktopManageCategoriesStlyed>
  );
};

export default DesktopManageCategoriesModal;
