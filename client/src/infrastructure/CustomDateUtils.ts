import {
  addDays,
  endOfMonth,
  format,
  fromUnixTime,
  getDaysInMonth,
  getTime,
  isAfter,
  isBefore,
  startOfMonth,
  subDays,
} from "date-fns";

export const DatesAreEqualWithoutTime = (a: Date, b: Date) => {
  if (a === null || b === null) {
    return false;
  }

  if (a.getFullYear() !== b.getFullYear()) {
    return false;
  }

  if (a.getMonth() !== b.getMonth()) {
    return false;
  }

  if (a.getDate() !== b.getDate()) {
    return false;
  }

  return true;
};

export const IsAfterOrEqual = (a: Date, b: Date) =>
  isAfter(a, b) || DatesAreEqualWithoutTime(a, b);

export const IsBeforeOrEqual = (a: Date, b: Date) =>
  isBefore(a, b) || DatesAreEqualWithoutTime(a, b);

export const StripTimeFromDate = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const FindDays = (date: Date, mondayIsFirstDay: boolean) => {
  const day = date.getDay();

  if (day === 0) {
    if (mondayIsFirstDay === false) {
      return {
        before: 0,
        after: 6,
      };
    }

    return {
      before: 6,
      after: 0,
    };
  }

  if (mondayIsFirstDay === false) {
    return {
      before: day,
      after: 7 - day - 1,
    };
  }

  return {
    before: day - 1,
    after: 7 - day,
  };
};

export const GetCalendarInDays = (now: Date, mondayIsFirstDay: boolean) => {
  const afterResult = FindDays(endOfMonth(now), mondayIsFirstDay);

  const after: Date[] = [];

  const afterLength = getDaysInMonth(now) - now.getDate() + afterResult.after;

  for (let i = 0; i < afterLength; i++) {
    after.push(addDays(now, i + 1));
  }

  const before: Date[] = [];

  const beforeResult = FindDays(startOfMonth(now), mondayIsFirstDay);

  const beforeLength = now.getDate() - 1 + beforeResult.before;

  for (let i = 0; i < beforeLength; i++) {
    before.push(subDays(now, i + 1));
  }

  before.reverse();

  return [...before, now, ...after].map(getTime);
};

export const DateOnlyToString = (date: Date) => format(date, "yyyy-MM-dd");

export const fromUnixTimeMs = (unix: number | null) =>
  unix === null ? null : fromUnixTime(unix / 1000);

export const isValidDate = (d: Date) =>
  d instanceof Date && !isNaN(d.getTime());
