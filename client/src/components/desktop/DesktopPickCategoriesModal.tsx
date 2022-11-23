import { Add, Settings, West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { FunctionComponent } from "react";
import { Category } from "../../server-api";
import DesktopPickCategoriesStyled from "../styles/desktop/DesktopPickCategories.styled";
import PickCategoryStyled from "../styles/PickCategory.styled";
import DefaultCategory from "../../state/DefaultCategory";
import Icons from "../../infrastructure/Icons";
import { useAppSelector } from "../../state/hooks";

export type DesktopPickCategoriesModalProps = {
  onClose: () => void;
  setCategory: (cat: Category) => void;
  onSettings: () => void;
  onAddCategory: () => void;
};

const DesktopPickCategoriesModal: FunctionComponent<
  DesktopPickCategoriesModalProps
> = ({ onClose, setCategory, onSettings, onAddCategory }) => {
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  return (
    <DesktopPickCategoriesStyled>
      <div className="flex items-center justify-between mx-2 mt-1">
        <IconButton onClick={() => onClose()}>
          <West />
        </IconButton>
        <h2 className="font-medium">Select Category</h2>
        <IconButton onClick={onSettings}>
          <Settings />
        </IconButton>
      </div>
      <div className="cats">
        {[...categories, DefaultCategory].map((cat, idx) => (
          <PickCategoryStyled key={idx} bgColor={cat.bgColor}>
            <button
              className="wrapper"
              onClick={() => {
                setCategory(cat);
                onClose();
              }}
            >
              <div className="icon">{Icons[cat.icon]}</div>
              <h4>{cat.name}</h4>
            </button>
          </PickCategoryStyled>
        ))}
      </div>
      <Button onClick={onAddCategory} className="ml-3 mb-1" startIcon={<Add />}>
        Add Category
      </Button>
    </DesktopPickCategoriesStyled>
  );
};

export default DesktopPickCategoriesModal;
