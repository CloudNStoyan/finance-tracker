import { Moment } from "moment";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Transaction } from "../server-api";
import CalendarDayStyled from "./styles/CalendarDay.styled";

export type CalendarDayProps = {
  date: Moment;
  transactions: Transaction[];
  month: number;
  selected: Moment;
  isToday: boolean;
  onClick: (date: Moment) => void;
};

const CalendarDay: FunctionComponent<CalendarDayProps> = ({
  date,
  transactions,
  month,
  selected,
  isToday,
  onClick,
}) => {
  const total = transactions.reduce(
    (state, transaction) =>
      transaction.type === "expense"
        ? state - transaction.value
        : state + transaction.value,
    0
  );

  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    setIsSelected(selected.format("YYYY-MM-DD") === date.format("YYYY-MM-DD"));
  }, [selected, date]);

  const notFromSameMonth = date.month() !== month;

  const show = date.date() === 1 || date.date() === date.daysInMonth();

  return (
    <CalendarDayStyled
      onClick={() => {
        onClick(date);
      }}
      className={`${date.format(
        "YYYY-MM-DD"
      )} flex flex-col text-center font-semibold ${
        notFromSameMonth ? "opacity-50" : ""
      } ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} `}
    >
      <div className="text-md w-full text-gray-700 dark:text-white">
        {date.date()}
      </div>
      <div
        className={`text-xs text-gray-500 dark:text-gray-300 w-full ${
          !show && !isSelected ? "invisible" : ""
        }`}
      >
        <div>{total.toFixed(2)}</div>
        <div>{total.toFixed(2)}</div>
      </div>
    </CalendarDayStyled>
  );
};

export default CalendarDay;
