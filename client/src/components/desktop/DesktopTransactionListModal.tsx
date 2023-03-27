import { Add } from "@mui/icons-material";
import { Dialog, IconButton } from "@mui/material";
import { format } from "date-fns";
import { FunctionComponent, useMemo } from "react";
import { styled } from "../../infrastructure/ThemeManager";
import {
  FilterTransactions,
  GetBalanceFromTransactions,
} from "../../infrastructure/TransactionsBuisnessLogic";
import { loadTransaction } from "../../state/addOrEditTransactionSlice";
import DefaultCategory from "../../state/DefaultCategory";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import DesktopTransactionInline from "./DesktopTransactionInline";

interface DesktopTransactionListModalProps {
  open: boolean;
  onClose: () => void;
  onTransactionClick: () => void;
  onCreateTransaction: () => void;
}

const DesktopTransactionListModalStyled = styled.div`
  width: 400px;
  padding: 10px;

  .transactions {
    max-height: 460px;
    overflow: hidden;
    overflow-y: scroll;
    padding-right: 5px;
    padding-left: 5px;

    &::-webkit-scrollbar {
      width: 0.4em;
    }
    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    }
    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.scrollBar};
      border-radius: 6px;
    }
  }

  .heading {
    margin-bottom: 20px;

    .display-date {
      font-size: 24px;
    }
  }
`;

const DesktopTransactionListModal: FunctionComponent<
  DesktopTransactionListModalProps
> = ({ open, onClose, onTransactionClick, onCreateTransaction }) => {
  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const allTransactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const { startBalance, days } = useAppSelector(
    (state) => state.calendarReducer
  );

  const transactions = useMemo(
    () => FilterTransactions(allTransactions, new Date(selected)),
    [allTransactions, selected]
  );

  const total = useMemo(
    () =>
      transactions.reduce(
        (state, transaction) =>
          transaction.type === "expense"
            ? state - transaction.value
            : state + transaction.value,
        0
      ),
    [transactions]
  );

  const dispatch = useAppDispatch();

  const balance = useMemo(
    () =>
      GetBalanceFromTransactions(
        allTransactions,
        startBalance,
        days,
        new Date(selected)
      ),
    [allTransactions, startBalance, days, selected]
  );

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
      <DesktopTransactionListModalStyled className="bg-white">
        <div className="heading flex justify-between">
          <div className="display-date">
            {format(new Date(selected), "MMMM dd")}
          </div>
          <div className="font-medium">
            <div className="text-gray-500 text-xs">Total Balance</div>
            <div className="text-right">{balance}</div>
          </div>
        </div>
        <div className="transactions flex flex-col gap-1">
          {transactions
            .sort((a, b) => a.value - b.value)
            .map((transaction) => {
              const transactionCat =
                categories.find(
                  (cat) => cat.categoryId === transaction.categoryId
                ) ?? DefaultCategory;

              return (
                <DesktopTransactionInline
                  onClick={() => {
                    onTransactionClick();
                    dispatch(
                      loadTransaction([transaction, transactionCat, selected])
                    );
                    onClose();
                  }}
                  transaction={transaction}
                  category={transactionCat}
                  key={transaction.transactionId}
                />
              );
            })}
        </div>
        <div className="my-3 relative">
          <div className="font-medium absolute right-0 text-right">
            <div className="text-gray-500 text-xs">Daily Change</div>
            <div>{total}</div>
          </div>
          <div className="flex justify-center">
            <IconButton
              onClick={() => {
                onCreateTransaction();
                onClose();
              }}
              className="bg-blue-500 dark:bg-purple-500 dark:text-gray-200 text-white"
            >
              <Add />
            </IconButton>
          </div>
        </div>
      </DesktopTransactionListModalStyled>
    </Dialog>
  );
};

export default DesktopTransactionListModal;
