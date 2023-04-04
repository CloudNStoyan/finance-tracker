import { Dialog } from "@mui/material";
import { FunctionComponent, useState } from "react";
import { useAppSelector } from "../../state/hooks";
import { Category } from "../../server-api";
import DesktopModalContainerStyled from "./DesktopModalContainer.styled";
import DesktopPickCategoriesModal from "./DesktopPickCategoriesModal";
import DesktopManageCategoriesModal from "./DesktopManageCategoriesModal";
import DesktopCategoryModal from "./DesktopCategoryModal";
import DesktopDescriptionModal from "./DesktopDescriptionModal";
import DesktopTransactionModal from "./DesktopTransactionModal";

export interface DesktopTransactionProps {
  open: boolean;
  onClose: () => void;
}

export type TransactionDialogModalType =
  | "transaction"
  | "select-category"
  | "manage-categories"
  | "category"
  | "description";

const DesktopTransaction: FunctionComponent<DesktopTransactionProps> = ({
  open,
  onClose,
}) => {
  const [currentModal, setCurrentModal] =
    useState<TransactionDialogModalType>("transaction");

  const [editCategory, setEditCategory] = useState<Category>(null);
  const { description } = useAppSelector(
    (state) => state.addOrEditTransactionReducer
  );

  const navigateToSettings = () => {
    setCurrentModal("manage-categories");
  };

  const navigateToTransaction = () => {
    setCurrentModal("transaction");
  };

  const navigateToCategory = () => {
    setCurrentModal("category");
  };

  const navigateToManageCategories = () => {
    setCurrentModal("manage-categories");
  };

  const navigateToSelectCategory = () => {
    setCurrentModal("select-category");
  };

  const handleAddCategory = () => {
    setEditCategory(null);
    navigateToCategory();
  };

  const handleManageCategory = (cat: Category) => {
    setEditCategory(cat);
    navigateToCategory();
  };

  const handleCategoryClose = () => {
    if (editCategory) {
      navigateToManageCategories();
      return;
    }

    navigateToSelectCategory();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      container={() => document.getElementById("app")}
      PaperProps={{
        style: {
          borderRadius: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <DesktopModalContainerStyled>
        {currentModal === "select-category" && (
          <DesktopPickCategoriesModal
            onClose={navigateToTransaction}
            onSettings={navigateToSettings}
            onAddCategory={handleAddCategory}
          />
        )}
        {currentModal === "manage-categories" && (
          <DesktopManageCategoriesModal
            onClose={navigateToSelectCategory}
            selectedCat={handleManageCategory}
            onAddCategory={handleAddCategory}
          />
        )}
        {currentModal === "category" && (
          <DesktopCategoryModal
            onClose={handleCategoryClose}
            category={editCategory}
          />
        )}
        {currentModal === "description" && (
          <DesktopDescriptionModal
            description={description}
            onClose={navigateToTransaction}
          />
        )}
        {currentModal === "transaction" && (
          <DesktopTransactionModal
            setCurrentModal={setCurrentModal}
            onClose={onClose}
          />
        )}
      </DesktopModalContainerStyled>
    </Dialog>
  );
};

export default DesktopTransaction;
