import { Add, West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import React, { FunctionComponent } from "react";
import { Category } from "../../server-api";
import DesktopManageCategoriesStlyed from "../styles/desktop/DesktopManageCategories.styled";
import DesktopCategoryInlineComponent from "./DesktopCategoryInline";
import SimpleTransition from "./SimpleTransition";

export type DesktopManageCategoriesModalProps = {
  categories: Category[];
  onClose: () => void;
  selectedCat: (cat: Category) => void;
  onAddCategory: () => void;
  transitionIn: boolean;
};

const DesktopManageCategoriesModal: FunctionComponent<
  DesktopManageCategoriesModalProps
> = ({ categories, onClose, selectedCat, onAddCategory, transitionIn }) => {
  return (
    <SimpleTransition transitionIn={transitionIn}>
      <DesktopManageCategoriesStlyed>
        <div className="flex items-center justify-start mx-2 mt-1">
          <IconButton onClick={() => onClose()}>
            <West />
          </IconButton>
          <h2 className="grow text-center">Manage Categories</h2>
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
        <Button
          onClick={onAddCategory}
          className="ml-3 mb-1"
          startIcon={<Add />}
        >
          Add Category
        </Button>
      </DesktopManageCategoriesStlyed>
    </SimpleTransition>
  );
};

export default DesktopManageCategoriesModal;
