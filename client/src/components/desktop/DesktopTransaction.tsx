import { Dialog } from "@mui/material";

import { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { Category } from "../../server-api";

import DesktopModalContainerStyled from "./DesktopModalContainer.styled";
import DesktopPickCategoriesModal from "./DesktopPickCategoriesModal";
import DesktopManageCategoriesModal from "./DesktopManageCategoriesModal";
import DesktopCategoryModal from "./DesktopCategoryModal";
import DesktopDescriptionModal from "./DesktopDescriptionModal";
import {
  setTransactionCategory,
  setTransactionDescription,
} from "../../state/addOrEditTransactionSlice";
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
  const [modalHistory, setModalHistory] = useState<
    TransactionDialogModalType[]
  >([]);

  const [editCategory, setEditCategory] = useState<Category>(null);
  const { description } = useAppSelector(
    (state) => state.addOrEditTransactionReducer
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    setModalHistory([currentModal, ...modalHistory.slice(0, 4)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModal]);

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
            onClose={() => setCurrentModal("transaction")}
            setCategory={(cat) => dispatch(setTransactionCategory(cat))}
            onSettings={() => setCurrentModal("manage-categories")}
            onAddCategory={() => {
              setEditCategory(null);
              setCurrentModal("category");
            }}
          />
        )}
        {currentModal === "manage-categories" && (
          <DesktopManageCategoriesModal
            onClose={() => setCurrentModal("select-category")}
            selectedCat={(cat) => {
              setEditCategory(cat);
              setCurrentModal("category");
            }}
            onAddCategory={() => {
              setEditCategory(null);
              setCurrentModal("category");
            }}
          />
        )}
        {currentModal === "category" && (
          <DesktopCategoryModal
            onClose={() => {
              setCurrentModal(modalHistory[1]);
            }}
            category={editCategory}
          />
        )}
        {currentModal === "description" && (
          <DesktopDescriptionModal
            description={description}
            onClose={() => setCurrentModal("transaction")}
            onDone={(descrp) => {
              dispatch(setTransactionDescription(descrp));
              setCurrentModal("transaction");
            }}
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
