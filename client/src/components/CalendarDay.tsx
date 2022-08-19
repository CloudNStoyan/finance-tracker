import {
  differenceInDays,
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  parseJSON,
  setYear,
} from "date-fns";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { useAppSelector } from "../state/hooks";
import CalendarDayStyled from "./styles/CalendarDay.styled";

export type CalendarDayProps = {
  date: Date;
  month: number;
  isToday: boolean;
  onClick: (date: Date) => void;
};

const CalendarDay: FunctionComponent<CalendarDayProps> = ({
  date,
  month,
  isToday,
  onClick,
}) => {
  const transactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const { startBalance, days } = useAppSelector(
    (state) => state.calendarReducer
  );

  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setTotal(
      transactions
        .filter((transaction) => {
          const transactionDate = parseJSON(transaction.transactionDate);

          if (
            (isAfter(date, transactionDate) &&
              transaction.repeat === "weekly" &&
              transactionDate.getDay() === date.getDay()) ||
            (transaction.repeat === "monthly" &&
              transactionDate.getDate() === date.getDate() &&
              isAfter(date, transactionDate)) ||
            (transaction.repeat === "yearly" &&
              transactionDate.getDate() === date.getDate() &&
              transactionDate.getMonth() === date.getMonth())
          ) {
            return true;
          }

          return DatesAreEqualWithoutTime(transactionDate, date);
        })
        .reduce(
          (state, transaction) =>
            transaction.type === "expense"
              ? state - transaction.value
              : state + transaction.value,
          0
        )
    );

    const eligableTransactions = transactions
      .filter((transaction) => {
        const transactionDate = parseJSON(transaction.transactionDate);
        const startDay = fromUnixTimeMs(days[0]);

        if (DatesAreEqualWithoutTime(date, transactionDate)) {
          return true;
        }

        if (
          isBefore(transactionDate, date) &&
          isAfter(transactionDate, startDay)
        ) {
          return true;
        }

        if (
          (transaction.repeat === "monthly" ||
            transaction.repeat === "weekly") &&
          isBefore(transactionDate, date)
        ) {
          return true;
        }

        const futureYearlyDate = setYear(transactionDate, date.getFullYear());

        if (DatesAreEqualWithoutTime(futureYearlyDate, date)) {
          return true;
        }

        if (
          transaction.repeat === "yearly" &&
          isAfter(futureYearlyDate, startDay) &&
          isAfter(date, futureYearlyDate) &&
          isBefore(futureYearlyDate, fromUnixTimeMs(days[days.length - 1]))
        ) {
          return true;
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

        if (transaction.repeat === "monthly") {
          if (
            (transactionDate.getDate() <= date.getDate() &&
              date.getMonth() === month) ||
            (date.getMonth() > month &&
              date.getDate() < transactionDate.getDate())
          ) {
            transactionValue = transaction.value;
          } else if (
            date.getMonth() > month &&
            date.getDate() >= transactionDate.getDate()
          ) {
            transactionValue = transactionValue * 2;
          } else {
            return 0;
          }
        }

        if (transaction.repeat === "weekly") {
          const startDay = fromUnixTimeMs(days[transactionDate.getDay() - 1]);

          let daysDiff = differenceInDays(date, transactionDate);

          if (isAfter(startDay, transactionDate)) {
            daysDiff = differenceInDays(date, startDay);
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
  }, [transactions, date, startBalance, month, days]);

  const [isSelected, setIsSelected] = useState(false);
  const selected = fromUnixTimeMs(
    useAppSelector((state) => state.calendarReducer.selected)
  );

  useEffect(() => {
    setIsSelected(DatesAreEqualWithoutTime(date, selected));
  }, [selected, date]);

  const notFromSameMonth = date.getMonth() !== month;

  const show =
    date.getDate() === 1 ||
    date.getDate() === getDaysInMonth(date) ||
    total !== 0 ||
    isToday;

  return (
    <CalendarDayStyled
      isDarkMode={isDarkMode}
      onClick={() => {
        onClick(date);
      }}
      className={`${format(
        date,
        "yyyy-MM-dd"
      )} flex flex-col text-center font-semibold ${
        notFromSameMonth ? "opacity-50" : ""
      } ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} `}
    >
      <div className="text-md w-full text-gray-700 dark:text-gray-200">
        {date.getDate()}
      </div>
      <div
        className={`text-xs text-gray-500 dark:text-gray-300 w-full ${
          !show && !isSelected ? "invisible" : ""
        }`}
      >
        <div>{`${total > 0 ? "+" : ""}${total.toFixed(2)}`}</div>
        <div>{`${balance > 0 ? "+" : ""}${balance.toFixed(2)}`}</div>
      </div>
    </CalendarDayStyled>
  );
};

export default CalendarDay;
