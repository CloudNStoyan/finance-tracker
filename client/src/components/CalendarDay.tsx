import { format, getDaysInMonth, isBefore, parseJSON } from "date-fns";
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

  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setTotal(
      transactions
        .filter((transaction) =>
          DatesAreEqualWithoutTime(parseJSON(transaction.transactionDate), date)
        )
        .reduce(
          (state, transaction) =>
            transaction.type === "expense"
              ? state - transaction.value
              : state + transaction.value,
          0
        )
    );

    setBalance(
      transactions
        .filter((transaction) => {
          const transactionDate = parseJSON(transaction.transactionDate);
          return (
            isBefore(transactionDate, date) ||
            DatesAreEqualWithoutTime(transactionDate, date)
          );
        })
        .reduce(
          (state, transaction) =>
            transaction.type === "expense"
              ? state - transaction.value
              : state + transaction.value,
          0
        )
    );
  }, [transactions, date]);

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
