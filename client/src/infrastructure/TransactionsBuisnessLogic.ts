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
  IsAfterOrEqual,
  IsBeforeOrEqual,
  StripTimeFromDate,
} from "./CustomDateUtils";

const GetTransactionOccurrencess = (
  date: Date,
  transactionDate: Date,
  repeatType: TransactionRepeat,
  repeatEvery: number,
  maxOccurrencess?: number,
  startDay?: Date
) => {
  if (repeatType === "yearly") {
    // its impossible to see two instances of a transaction that is on a yearly
    // basis so we don't calculate anything because it will be 1 every time.
    return 1;
  }

  let diff;

  if (repeatType === "daily") {
    diff = differenceInDays(date, transactionDate);
  }

  if (repeatType === "weekly") {
    diff = differenceInWeeks(date, transactionDate);
  }

  if (repeatType === "monthly") {
    diff = differenceInMonths(date, transactionDate);
  }

  let occurrences = Math.floor(diff / repeatEvery + 1);

  if (maxOccurrencess) {
    occurrences = Math.min(maxOccurrencess, occurrences);
  }

  if (startDay && isAfter(startDay, transactionDate)) {
    const offsetOccurrences = GetTransactionOccurrencess(
      startDay,
      transactionDate,
      repeatType,
      repeatEvery,
      maxOccurrencess
    );

    occurrences -= offsetOccurrences;
  }

  return Math.max(occurrences, 0);
};

export const GetBalanceFromTransactions = (
  transactions: Transaction[],
  startBalance: number,
  days: number[],
  date: Date
): number => {
  const dateWithoutTime = StripTimeFromDate(date);
  const startDay = fromUnixTimeMs(days[0]);

  const eligableTransactions = transactions.filter((transaction) => {
    let transactionDate = StripTimeFromDate(
      parseJSON(transaction.transactionDate)
    );

    if (isAfter(transactionDate, dateWithoutTime)) {
      return false;
    }

    if (transaction.repeat === "yearly") {
      transactionDate = new Date(
        transactionDate.setFullYear(date.getFullYear())
      );
    }

    if (transaction.repeat === null || transaction.repeat === "yearly") {
      return (
        IsAfterOrEqual(transactionDate, startDay) &&
        IsBeforeOrEqual(transactionDate, dateWithoutTime)
      );
    }

    return true;
  });

  const transactionValues = eligableTransactions.map((transaction) => {
    let transactionValue = transaction.value;

    if (transaction.repeat === null) {
      return transaction.type === "expense"
        ? transactionValue * -1
        : transactionValue;
    }

    const transactionDate = StripTimeFromDate(
      parseJSON(transaction.transactionDate)
    );
    const repeatEnd = parseJSON(transaction.repeatEndDate);

    const untillDate =
      transaction.repeatEndType === "on" && isBefore(repeatEnd, dateWithoutTime)
        ? repeatEnd
        : dateWithoutTime;

    const occurrences = GetTransactionOccurrencess(
      untillDate,
      transactionDate,
      transaction.repeat,
      transaction.repeatEvery,
      transaction.repeatEndOccurrences,
      startDay
    );

    transactionValue *= occurrences;

    return transaction.type === "expense"
      ? transactionValue * -1
      : transactionValue;
  });

  const newBalance = transactionValues.reduce(
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
    const repeatEnd = parseJSON(transaction.repeatEndDate);

    if (isBefore(dateWithoutTime, transactionDate)) {
      return false;
    }

    if (transaction.repeat === "daily") {
      const daysDiff = differenceInDays(dateWithoutTime, transactionDate);

      if (daysDiff % transaction.repeatEvery !== 0) {
        return false;
      }

      if (transaction.repeatEndType === "on") {
        return IsAfterOrEqual(repeatEnd, dateWithoutTime);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = daysDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrEqual(dateWithoutTime, transactionDate) &&
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
        return IsAfterOrEqual(repeatEnd, dateWithoutTime);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = weeksDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrEqual(dateWithoutTime, transactionDate) &&
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
        return IsAfterOrEqual(repeatEnd, dateWithoutTime);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = monthsDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrEqual(dateWithoutTime, transactionDate) &&
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
        return IsAfterOrEqual(repeatEnd, dateWithoutTime);
      }

      if (transaction.repeatEndType === "after") {
        const occurrences = yearsDiff / transaction.repeatEvery + 1;
        return (
          IsAfterOrEqual(dateWithoutTime, transactionDate) &&
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
