import { differenceInDays, isAfter, parseJSON } from "date-fns";
import { Transaction } from "../server-api";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
  StripTimeFromDate,
} from "./CustomDateUtils";

export const GetBalanceFromTransactions = (
  transactions: Transaction[],
  startBalance: number,
  days: number[],
  date: Date
): number => {
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

  return newBalance + startBalance;
};

export const FilterTransactions = (
  transactions: Transaction[],
  date: Date
): Transaction[] => {
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.transactionDate);

    const dateWithoutTime = StripTimeFromDate(date);

    const repeatEnd =
      transaction.repeatEnd !== null ? new Date(transaction.repeatEnd) : null;

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
  });
};

export const GetTotalFromTransactionsByDate = (
  transactions: Transaction[],
  date: Date
): number => {
  const totalTransactions = FilterTransactions(transactions, date);

  return totalTransactions.reduce(
    (state, transaction) =>
      transaction.type === "expense"
        ? state - transaction.value
        : state + transaction.value,
    0
  );
};
