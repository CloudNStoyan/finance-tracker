import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import DefaultCategory from "../../state/DefaultCategory";
import { Transaction } from "../../server-api";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import DesktopCalendarDayStyled from "./DesktopCalendarDay.styled";
import DesktopCalendarTransaction from "./DesktopCalendarTransaction";
import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  FilterTransactions,
  GetBalanceFromTransactions,
} from "../../infrastructure/TransactionsBuisnessLogic";
import { loadTransaction } from "../../state/addOrEditTransactionSlice";

export interface DesktopCalendarDayProps {
  date: Date;
  month: number;
  isToday: boolean;
  onCreateTransaction: (date: Date) => void;
  onTransactionClick: () => void;
  searchInputValue?: string;
}

const DesktopCalendarDay: FunctionComponent<DesktopCalendarDayProps> = ({
  date,
  month,
  isToday,
  onCreateTransaction,
  onTransactionClick,
  searchInputValue,
}) => {
  const allTransactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const { days, startBalance } = useAppSelector(
    (state) => state.calendarReducer
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [notSearchRelevant, setNotSearchRelevant] = useState(false);

  const compareTransactionToSearchValue = useCallback(
    (transaction: Transaction) => {
      if (
        transaction.label
          .toLowerCase()
          .includes(searchInputValue?.toLowerCase())
      ) {
        return transaction;
      }

      if (
        transaction.details &&
        transaction.details
          .toLowerCase()
          .includes(searchInputValue?.toLowerCase())
      ) {
        return transaction;
      }

      if (transaction.value.toFixed(2).includes(searchInputValue)) {
        return transaction;
      }

      const transactionCategory =
        categories.find((cat) => cat.categoryId === transaction.categoryId) ??
        DefaultCategory;

      if (
        transactionCategory?.name
          .toLowerCase()
          .includes(searchInputValue?.toLowerCase())
      ) {
        return transaction;
      }
    },
    [categories, searchInputValue]
  );

  useEffect(() => {
    if (!searchInputValue || searchInputValue.trim().length === 0) {
      setNotSearchRelevant(false);
      return;
    }

    const foundTransaction = transactions.findIndex(
      compareTransactionToSearchValue
    );

    if (foundTransaction === -1) {
      setNotSearchRelevant(true);
      return;
    }

    setNotSearchRelevant(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInputValue]);

  useEffect(() => {
    if (transactions.length === 0) {
      setTotal(0);
      return;
    }

    setTotal(
      transactions.reduce(
        (state, transaction) =>
          transaction.type === "expense"
            ? state - transaction.value
            : state + transaction.value,
        0
      )
    );
  }, [transactions]);

  useEffect(() => {
    setTransactions(FilterTransactions(allTransactions, date));
    setBalance(
      GetBalanceFromTransactions(allTransactions, startBalance, days, date)
    );
  }, [allTransactions, date, month, days, startBalance]);

  const { selected } = useAppSelector((state) => state.calendarReducer);

  const notFromSameMonth = date.getMonth() !== month;

  const nodeRef = useRef(null);
  const dispatch = useAppDispatch();

  return (
    <DesktopCalendarDayStyled
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex flex-col text-center ${
        notFromSameMonth ? "opacity-50" : ""
      } ${notSearchRelevant ? "fade-off" : ""} ${isToday ? "today" : ""} `}
    >
      <div
        className={`text-md w-full action-bar text-left ${
          isToday ? "text-white" : "text-gray-700"
        } dark:text-white p-1 pl-2 flex justify-between`}
      >
        <div className="date-number">{date.getDate()}</div>
        <div className="stats flex mr-1 relative items-center" ref={nodeRef}>
          {isHovered ? (
            <IconButton
              onClick={() => onCreateTransaction(date)}
              size="large"
              className="open-modal-btn absolute right-0 bg-blue-500 dark:bg-purple-500 dark:text-gray-200 text-white"
            >
              <Add />
            </IconButton>
          ) : (
            <div className="flex gap-1 numbers stats-numbers">
              {transactions.length > 0 && (
                <>
                  <div>{total.toFixed(2)}</div>
                  {"|"}
                </>
              )}

              <div>{balance.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="transactions flex flex-col">
        {(searchInputValue?.trim().length > 0
          ? transactions.filter(compareTransactionToSearchValue)
          : transactions
        ).map((transaction, idx) => {
          const transactionCat =
            categories.find(
              (cat) => cat.categoryId === transaction.categoryId
            ) ?? DefaultCategory;

          return (
            <DesktopCalendarTransaction
              onClick={() => {
                onTransactionClick();
                dispatch(
                  loadTransaction([transaction, transactionCat, selected])
                );
              }}
              category={transactionCat}
              transaction={transaction}
              key={idx}
            />
          );
        })}
      </div>
    </DesktopCalendarDayStyled>
  );
};

export default DesktopCalendarDay;
