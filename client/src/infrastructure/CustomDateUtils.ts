import { format, fromUnixTime } from "date-fns";

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

export const FindDays = (date: Date, mondayIsFirstDay: boolean) => {
  const day = date.getDay();

  if (day === 0) {
    if (mondayIsFirstDay === true) {
      return {
        before: 6,
        after: 0,
      };
    }

    return {
      before: 6,
      after: 0,
    };
  }

  return {
    before: day - 1,
    after: 7 - day,
  };
};

export const DateOnlyToString = (date: Date) => format(date, "yyyy-MM-dd");

export const fromUnixTimeMs = (unix: number | null) =>
  unix === null ? null : fromUnixTime(unix / 1000);

export const isValidDate = (d: Date) =>
  d instanceof Date && !isNaN(d.getTime());
