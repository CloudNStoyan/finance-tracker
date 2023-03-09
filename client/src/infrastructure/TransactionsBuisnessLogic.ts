import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  isAfter,
  isBefore,
  parseJSON,
} from "date-fns";
import { Transaction, TransactionRepeat } from "../server-api";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
  IsAfterOrNow,
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
        transaction.repeatEndDate !== null &&
        new Date(transaction.repeatEndDate) < startDay
      ) {
        return false;
      }

      if (transaction.repeat === "daily") {
        return true;
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
        transaction.repeatEndDate !== null
          ? parseJSON(transaction.repeatEndDate)
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

      if (transaction.repeat === "daily") {
        if (transaction.repeatEndType === "on") {
          const daysDiff = differenceInDays(tillDate, transactionDate) + 1;

          transactionValue *= daysDiff;
        }

        if (transaction.repeatEndType === "after") {
          const daysDiff = differenceInDays(date, transactionDate) + 1;

          transactionValue *=
            daysDiff > transaction.repeatEndOccurrences
              ? transaction.repeatEndOccurrences
              : daysDiff;
        }
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
    const dateWithoutTime = StripTimeFromDate(date);
    const transactionDate = new Date(transaction.transactionDate);
    const repeatEnd = new Date(transaction.repeatEndDate);

    if (isBefore(dateWithoutTime, transactionDate)) {
      return false;
    }

    if (transaction.repeat === "daily") {
      const daysDiff = differenceInDays(dateWithoutTime, transactionDate);

      if (daysDiff % transaction.repeatEvery !== 0) {
        return false;
      }

      if (transaction.repeatEndType === "on") {
        return IsAfterOrNow(repeatEnd, transactionDate);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = daysDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrNow(dateWithoutTime, transactionDate) &&
          occurrences <= transaction.repeatEndOccurrences
        );
      }

      // repeat end is never
      return true;
    }

    if (transaction.repeat === "weekly") {
      // if its not the same day we don't need to do any more checks
      if (transactionDate.getDay() !== dateWithoutTime.getDay()) {
        return false;
      }

      const weeksDiff = differenceInWeeks(dateWithoutTime, transactionDate);

      if (weeksDiff % transaction.repeatEvery !== 0) {
        return false;
      }

      if (transaction.repeatEndType === "on") {
        return IsAfterOrNow(repeatEnd, transactionDate);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = weeksDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrNow(dateWithoutTime, transactionDate) &&
          occurrences <= transaction.repeatEndOccurrences
        );
      }

      // repeat end is never
      return true;
    }

    if (transaction.repeat === "monthly") {
      if (transactionDate.getDate() !== dateWithoutTime.getDate()) {
        return false;
      }

      const monthsDiff = differenceInMonths(dateWithoutTime, transactionDate);

      if (monthsDiff % transaction.repeatEvery !== 0) {
        return false;
      }

      if (transaction.repeatEndType === "on") {
        return IsAfterOrNow(repeatEnd, transactionDate);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = monthsDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrNow(dateWithoutTime, transactionDate) &&
          occurrences <= transaction.repeatEndOccurrences
        );
      }

      // repeat end is never
      return true;
    }

    if (transaction.repeat === "yearly") {
      if (
        transactionDate.getDate() !== dateWithoutTime.getDate() ||
        transactionDate.getMonth() !== dateWithoutTime.getMonth()
      ) {
        return false;
      }

      const yearsDiff = differenceInYears(dateWithoutTime, transactionDate);

      if (yearsDiff % transaction.repeatEvery !== 0) {
        return false;
      }

      if (transaction.repeatEndType === "on") {
        return IsAfterOrNow(repeatEnd, transactionDate);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = yearsDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrNow(dateWithoutTime, transactionDate) &&
          occurrences <= transaction.repeatEndOccurrences
        );
      }

      // repeat end is never
      return true;
    }

    return DatesAreEqualWithoutTime(transactionDate, dateWithoutTime);
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

const ConvertRepeatTypeToHuman = (repeatType: TransactionRepeat) => {
  switch (repeatType) {
    case "daily":
      return "day";
    case "weekly":
      return "week";
    case "monthly":
      return "month";
    case "yearly":
      return "year";
  }
};

export const ConvertRepeatLogicToHumanText = (
  date: Date,
  repeatType: TransactionRepeat,
  occurrences: number,
  repeatEndType?: "after" | "on" | "never",
  repeatEndDate?: Date,
  repeatEndOccurrences?: number
) => {
  let text = "Every ";

  const repeatTypeText = ConvertRepeatTypeToHuman(repeatType);

  if (occurrences > 1) {
    text += `${occurrences} ${repeatTypeText}s`;
  } else {
    text += repeatTypeText;
  }

  let dateFormat: string = null;

  if (repeatType === "weekly") {
    dateFormat = "EEEE";
  }

  if (repeatType === "monthly") {
    dateFormat = "'the' do";
  }

  if (repeatType === "yearly") {
    dateFormat = "MMMM 'the' do";
  }

  if (repeatType && repeatType !== "daily") {
    text += ` (on ${format(date, dateFormat)})`;
  }

  if (repeatEndType === "on" && repeatEndDate) {
    text += `, until ${format(repeatEndDate, "MMMM dd yyyy")}`;
  }

  if (repeatEndType === "after" && repeatEndOccurrences) {
    text += `, ${repeatEndOccurrences} time${
      repeatEndOccurrences > 1 ? "s" : ""
    }`;
  }

  return text;
};
