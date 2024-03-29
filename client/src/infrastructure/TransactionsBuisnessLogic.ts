import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarMonths,
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  isAfter,
  isBefore,
  isLastDayOfMonth,
  lastDayOfMonth,
  parseJSON,
} from "date-fns";
import { Category, Transaction, TransactionRepeatType } from "../server-api";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
  IsAfterOrEqual,
  IsBeforeOrEqual,
  StripTimeFromDate,
} from "./CustomDateUtils";
import DefaultCategory from "../state/DefaultCategory";

const GetTransactionOccurrencess = (
  date: Date,
  transactionDate: Date,
  repeatType: TransactionRepeatType,
  repeatEvery: number,
  maxOccurrencess?: number,
  startDay?: Date
) => {
  if (repeatType === "yearly") {
    // its impossible to see two instances of a transaction that is on a yearly basis
    // so we don't calculate anything because it will only be a single occurrence each time.
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
    diff = differenceInCalendarMonths(date, transactionDate);

    if (date.getDate() < transactionDate.getDate() && !isLastDayOfMonth(date)) {
      diff -= 1;
    }
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

export const GetTransactionOccurrencessInDates = (
  startDay: Date,
  lastDay: Date,
  transactionDate: Date,
  repeatType: TransactionRepeatType,
  repeatEvery: number,
  maxOccurrences?: number
) => {
  const occurrences = GetTransactionOccurrencess(
    lastDay,
    transactionDate,
    repeatType,
    repeatEvery,
    maxOccurrences,
    startDay
  );

  let addFn: (date: Date, amount: number) => Date = null;

  if (repeatType === "daily") {
    addFn = addDays;
  }

  if (repeatType === "weekly") {
    addFn = addWeeks;
  }

  const dates: Date[] = [];

  for (let i = 1; i < occurrences; i++) {
    dates.push(addFn(transactionDate, i * repeatEvery));
  }

  return dates;
};

export const GetNextTransactionOccurrenceDate = (
  transactionDate: number,
  repeatType: TransactionRepeatType,
  repeatEvery: number
) => {
  let addFn: (date: Date, amount: number) => Date = null;

  if (repeatType === "daily") {
    addFn = addDays;
  }

  if (repeatType === "weekly") {
    addFn = addWeeks;
  }

  if (repeatType === "monthly") {
    addFn = addMonths;
  }

  if (repeatType === "yearly") {
    addFn = addYears;
  }

  return addFn(new Date(transactionDate), repeatEvery).getTime();
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
      const transactionDateDoesntOccurreInThisMonth =
        isLastDayOfMonth(dateWithoutTime) &&
        lastDayOfMonth(transactionDate).getDate() > dateWithoutTime.getDate();

      if (
        transactionDate.getDate() !== dateWithoutTime.getDate() &&
        !transactionDateDoesntOccurreInThisMonth
      ) {
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

export const GetMaxTransactionsCount = (containerEl: HTMLDivElement) => {
  const TRANSACTION_ELEMENT_HEIGHT = 22; // 18 (actual height) + 4 (margin) + 0 (padding)

  return Math.floor(
    (containerEl.offsetHeight - 5) / TRANSACTION_ELEMENT_HEIGHT
  );
};

export const FilterSearchTransactions = (
  transactions: Transaction[],
  search: string,
  categories: Category[]
) => {
  const filteredTransactions = transactions.filter((transaction) => {
    if (transaction.label.toLowerCase().includes(search.toLowerCase())) {
      return transaction;
    }

    if (transaction.value.toString().includes(search)) {
      return transaction;
    }

    const transactionCategory =
      categories.find((cat) => cat.categoryId === transaction.categoryId) ??
      DefaultCategory;

    if (
      transactionCategory.name
        .toLowerCase()
        .includes(search.toLocaleLowerCase())
    ) {
      return transaction;
    }
  });

  return filteredTransactions;
};
