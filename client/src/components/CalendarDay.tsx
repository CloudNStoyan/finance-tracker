import { getDaysInMonth } from "date-fns";
import { FunctionComponent, useEffect, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { styled } from "../infrastructure/ThemeManager";
import {
  GetBalanceFromTransactions,
  GetTotalFromTransactionsByDate,
} from "../infrastructure/TransactionsBuisnessLogic";
import { useAppSelector } from "../state/hooks";

export interface CalendarDayProps {
  date: Date;
  month: number;
  isToday: boolean;
  onClick: (date: Date) => void;
}

const CalendarDayStyled = styled.button<{ isDarkMode: boolean }>`
  -webkit-tap-highlight-color: transparent;
  border-right: 2px solid transparent;
  animation: custom-scale-0-1 0.25s;

  &.selected {
    border-color: ${({ theme }) => theme.colors.topbarBg};
  }

  &:not(.selected).today {
    border-color: ${({ isDarkMode }) => (isDarkMode ? "gray" : "#222")};
  }
`;

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

  const onDayClicked = () => {
    onClick(date);
  };

  useEffect(() => {
    setTotal(GetTotalFromTransactionsByDate(transactions, date));
    setBalance(
      GetBalanceFromTransactions(transactions, startBalance, days, date)
    );
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
      onClick={onDayClicked}
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
