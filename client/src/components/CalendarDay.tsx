import { format, getDaysInMonth, parseJSON } from "date-fns";
import React, { FunctionComponent, useEffect, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { Transaction } from "../server-api";
import { useAppSelector } from "../state/hooks";
import CalendarDayStyled from "./styles/CalendarDay.styled";

export type CalendarDayProps = {
  date: Date;
  transactions: Transaction[];
  month: number;
  isToday: boolean;
  onClick: (date: Date) => void;
};

const CalendarDay: FunctionComponent<CalendarDayProps> = ({
  date,
  transactions,
  month,
  isToday,
  onClick,
}) => {
  const total = transactions
    .filter((transaction) =>
      DatesAreEqualWithoutTime(parseJSON(transaction.transactionDate), date)
    )
    .reduce(
      (state, transaction) =>
        transaction.type === "expense"
          ? state - transaction.value
          : state + transaction.value,
      0
    );
  const balance = transactions.reduce(
    (state, transaction) =>
      transaction.type === "expense"
        ? state - transaction.value
        : state + transaction.value,
    0
  );

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
      <div className="text-md w-full text-gray-700 dark:text-white">
        {date.getDate()}
      </div>
      <div
        className={`text-xs text-gray-500 dark:text-gray-300 w-full ${
          !show && !isSelected ? "invisible" : ""
        }`}
      >
        <div>{total.toFixed(2)}</div>
        <div>{balance.toFixed(2)}</div>
      </div>
    </CalendarDayStyled>
  );
};

export default CalendarDay;
