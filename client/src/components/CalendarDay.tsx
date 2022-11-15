import { differenceInDays, getDaysInMonth, isAfter, parseJSON } from "date-fns";
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

          const dateWithoutTime = new Date(date);
          dateWithoutTime.setHours(0, 0, 0, 0);

          const repeatEnd =
            transaction.repeatEnd !== null
              ? parseJSON(transaction.repeatEnd)
              : null;

          const tillDate =
            repeatEnd !== null && repeatEnd < dateWithoutTime
              ? repeatEnd
              : dateWithoutTime;

          if (repeatEnd !== null && repeatEnd < dateWithoutTime) {
            return false;
          }

          if (
            (isAfter(tillDate, transactionDate) &&
              transaction.repeat === "weekly" &&
              transactionDate.getDay() === tillDate.getDay()) ||
            (transaction.repeat === "monthly" &&
              transactionDate.getDate() === tillDate.getDate() &&
              isAfter(tillDate, transactionDate)) ||
            (transaction.repeat === "yearly" &&
              transactionDate.getDate() === tillDate.getDate() &&
              transactionDate.getMonth() === tillDate.getMonth() &&
              transactionDate.getFullYear() <= tillDate.getFullYear())
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
          return true;
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
          const occurrences = days
            .slice(1)
            .map((dN) => new Date(new Date(dN).setHours(0, 0, 0, 0)))
            .filter((d) => d <= tillDate)
            .filter((d) => d.getDate() === transactionDate.getDate()).length;

          transactionValue = transactionValue * occurrences;
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
      className={`flex flex-col text-center font-semibold ${
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
