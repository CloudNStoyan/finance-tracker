import { useAppSelector } from "../state/hooks";
import TransactionInline from "./TransactionInline";
import DefaultCategory from "../state/DefaultCategory";
import { FilterTransactions } from "../infrastructure/TransactionsBuisnessLogic";
import { useMemo } from "react";

const CalendarTransactionList = () => {
  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const allTransactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const transactions = useMemo(
    () => FilterTransactions(allTransactions, new Date(selected)),
    [allTransactions, selected]
  );

  return (
    <div className="flex flex-col gap-1 p-1 h-full mt-2 w-screen mb-2 overflow-hidden overflow-y-scroll">
      {selected &&
        transactions
          .sort((a, b) => a.value - b.value)
          .map((transaction) => (
            <TransactionInline
              transaction={transaction}
              category={
                categories.find(
                  (cat) => cat.categoryId === transaction.categoryId
                ) ?? DefaultCategory
              }
              key={transaction.transactionId}
            />
          ))}
    </div>
  );
};

export default CalendarTransactionList;
