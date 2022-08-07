import { format, getDaysInMonth } from "date-fns";
import React, { FunctionComponent, useEffect, useState } from "react";
import { DatesAreEqualWithoutTime } from "../infrastructure/CustomDateUtils";
import { Transaction } from "../server-api";
import CalendarDayStyled from "./styles/CalendarDay.styled";

export type CalendarDayProps = {
  date: Date;
  transactions: Transaction[];
  month: number;
  selected: Date;
  isToday: boolean;
  onClick: (date: Date) => void;
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
    setIsSelected(DatesAreEqualWithoutTime(date, selected));
  }, [selected, date]);

  const notFromSameMonth = date.getMonth() !== month;

  const show = date.getDate() === 1 || date.getDate() === getDaysInMonth(date);

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
        <div>{total.toFixed(2)}</div>
      </div>
    </CalendarDayStyled>
  );
};

export default CalendarDay;
