import React from "react";
import { useAppSelector } from "../state/hooks";
import TransactionInline from "./TransactionInline";
import DefaultCategory from "../state/DefaultCategory";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { parseJSON } from "date-fns";

const CalendarTransactionList = () => {
  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const transactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  return (
    <div className="flex flex-col gap-1 p-1 h-full mt-2 w-screen mb-2 overflow-hidden overflow-y-scroll">
      {transactions
        .filter((transaction) =>
          DatesAreEqualWithoutTime(
            parseJSON(transaction.transactionDate),
            fromUnixTimeMs(selected)
          )
        )
        .map((transaction, idx) => (
          <TransactionInline
            transaction={transaction}
            category={
              categories.find(
                (cat) => cat.categoryId === transaction.categoryId
              ) ?? DefaultCategory
            }
            key={idx}
          />
        ))}
    </div>
  );
};

export default CalendarTransactionList;
