import { useAppSelector } from "../state/hooks";
import TransactionInline from "./TransactionInline";
import DefaultCategory from "../state/DefaultCategory";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { parseJSON } from "date-fns";
import { isAfter } from "date-fns/esm";

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
      {selected &&
        transactions
          .filter((transaction) => {
            const date = new Date(
              fromUnixTimeMs(selected).setHours(0, 0, 0, 0)
            );

            const transactionDate = parseJSON(transaction.transactionDate);

            const repeatEnd =
              transaction.repeatEnd !== null
                ? parseJSON(transaction.repeatEnd)
                : null;

            const tillDate =
              repeatEnd !== null && repeatEnd < date ? repeatEnd : date;

            if (repeatEnd !== null && repeatEnd < date) {
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
