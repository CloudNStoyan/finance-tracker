import { differenceInDays, format, isAfter, parseJSON } from "date-fns";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../../infrastructure/CustomDateUtils";
import DefaultCategory from "../../state/DefaultCategory";
import { Transaction } from "../../server-api";
import { useAppSelector } from "../../state/hooks";
import DesktopCalendarDayStyled from "../styles/desktop/DesktopCalendarDay.styled";
import DesktopCalendarTransaction from "./DesktopCalendarTransaction";
import { IconButton } from "@mui/material";
import { Add } from "@mui/icons-material";

export type DesktopCalendarDayProps = {
  date: Date;
  month: number;
  isToday: boolean;
  onClick: (date: Date) => void;
  onTransactionClick: (transaction: Transaction) => void;
  searchInputValue: string;
};

const DesktopCalendarDay: FunctionComponent<DesktopCalendarDayProps> = ({
  date,
  month,
  isToday,
  onClick,
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
        transaction.label.toLowerCase().includes(searchInputValue.toLowerCase())
      ) {
        return transaction;
      }

      if (
        transaction.details &&
        transaction.details
          .toLowerCase()
          .includes(searchInputValue.toLowerCase())
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
          .includes(searchInputValue.toLowerCase())
      ) {
        return transaction;
      }
    },
    [categories, searchInputValue]
  );

  useEffect(() => {
    if (searchInputValue.trim().length === 0) {
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
    setTransactions(
      allTransactions.filter((transaction) => {
        const transactionDate = parseJSON(transaction.transactionDate);

        const repeatEnd =
          transaction.repeatEnd !== null
            ? parseJSON(transaction.repeatEnd)
            : null;

        const tillDate =
          repeatEnd !== null && repeatEnd < date ? repeatEnd : date;

        if (
          (isAfter(tillDate, transactionDate) &&
            transaction.repeat === "weekly" &&
            transactionDate.getDay() === tillDate.getDay()) ||
          (transaction.repeat === "monthly" &&
            transactionDate.getDate() === tillDate.getDate() &&
            isAfter(tillDate, transactionDate)) ||
          (transaction.repeat === "yearly" &&
            transactionDate.getDate() === tillDate.getDate() &&
            transactionDate.getMonth() === tillDate.getMonth())
        ) {
          return true;
        }

        return DatesAreEqualWithoutTime(transactionDate, date);
      })
    );

    const eligableTransactions = allTransactions
      .filter((transaction) => {
        const transactionDate = parseJSON(transaction.transactionDate);
        const startDay = fromUnixTimeMs(days[0]);

        if (transaction.repeat === null) {
          if (transactionDate > startDay && transactionDate <= date) {
            return true;
          }

          return false;
        }

        // no more normal equations now its only the repeat ones

        if (transactionDate > date) {
          return false;
        }

        if (
          transaction.repeatEnd !== null &&
          new Date(transaction.repeatEnd) < startDay
        ) {
          return false;
        }

        if (transaction.repeat === "weekly") {
          return true;
        }

        if (transaction.repeat === "monthly") {
          if (
            transactionDate.getDate() <= date.getDate() ||
            month < date.getMonth()
          ) {
            return true;
          }
        }

        if (transaction.repeat === "yearly") {
          const nextDate = new Date(
            transactionDate.setFullYear(date.getFullYear())
          );

          if (nextDate > startDay && nextDate <= date) {
            return true;
          }
        }
        return false;
      })
      .map((transaction) => {
        let transactionValue = transaction.value;

        if (transaction.repeat === null) {
          return transaction.type === "expense"
            ? transactionValue * -1
            : transactionValue;
        }

        const transactionDate = parseJSON(transaction.transactionDate);

        const repeatEnd =
          transaction.repeatEnd !== null
            ? parseJSON(transaction.repeatEnd)
            : null;

        const tillDate =
          repeatEnd !== null && repeatEnd < date ? repeatEnd : date;

        if (transaction.repeat === "monthly") {
          if (
            (transactionDate.getDate() <= tillDate.getDate() &&
              tillDate.getMonth() === month) ||
            (tillDate.getMonth() > month &&
              tillDate.getDate() < transactionDate.getDate())
          ) {
            transactionValue = transaction.value;
          } else if (
            tillDate.getMonth() > month &&
            tillDate.getDate() >= transactionDate.getDate()
          ) {
            transactionValue = transactionValue * 2;
          } else {
            return 0;
          }
        }

        if (transaction.repeat === "weekly") {
          const startDay = fromUnixTimeMs(days[transactionDate.getDay() - 1]);

          let daysDiff = differenceInDays(tillDate, transactionDate);

          if (isAfter(startDay, transactionDate)) {
            daysDiff = differenceInDays(tillDate, startDay);
          }

          const multiplier = Math.floor(daysDiff / 7) + 1;

          transactionValue = transactionValue * multiplier;
        }

        return transaction.type === "expense"
          ? transactionValue * -1
          : transactionValue;
      });

    const newBalance = eligableTransactions.reduce(
      (state, value) => state + value,
      0
    );

    setBalance(newBalance + startBalance);
  }, [allTransactions, date, month, days, startBalance]);

  const [isSelected, setIsSelected] = useState(false);
  const selected = fromUnixTimeMs(
    useAppSelector((state) => state.calendarReducer.selected)
  );

  useEffect(() => {
    setIsSelected(DatesAreEqualWithoutTime(date, selected));
  }, [selected, date]);

  const notFromSameMonth = date.getMonth() !== month;

  return (
    <DesktopCalendarDayStyled
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${format(date, "yyyy-MM-dd")} flex flex-col text-center ${
        notFromSameMonth ? "opacity-50" : ""
      } ${notSearchRelevant ? "opacity-25" : ""} ${
        isSelected ? "selected" : ""
      } ${isToday ? "today" : ""} `}
    >
      <div
        className={`text-md w-full action-bar text-left ${
          isToday ? "text-white" : "text-gray-700"
        } dark:text-white p-1 pl-2 flex justify-between`}
      >
        <div className="date-number">{date.getDate()}</div>
        <div className="stats flex mr-1 relative items-center">
          {isHovered ? (
            <IconButton
              onClick={() => onClick(date)}
              size="large"
              className="absolute right-0 bg-blue-500 dark:bg-purple-500 dark:text-gray-200 text-white"
            >
              <Add />
            </IconButton>
          ) : (
            <div className="flex gap-1">
              <div>{total.toFixed(2)}</div>
              {"|"}
              <div>{balance.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="transactions flex flex-col">
        {(searchInputValue.trim().length > 0
          ? transactions.filter(compareTransactionToSearchValue)
          : transactions
        ).map((transaction, idx) => (
          <DesktopCalendarTransaction
            onClick={() => onTransactionClick(transaction)}
            category={
              categories.find(
                (cat) => cat.categoryId === transaction.categoryId
              ) ?? DefaultCategory
            }
            transaction={transaction}
            key={idx}
          />
        ))}
      </div>
    </DesktopCalendarDayStyled>
  );
};

export default DesktopCalendarDay;
