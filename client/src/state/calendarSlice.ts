import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addDays,
  endOfMonth,
  format,
  getDaysInMonth,
  getTime,
  startOfMonth,
  subDays,
} from "date-fns";
import {
  FindDays,
  fromUnixTimeMs,
  isValidDate,
} from "../infrastructure/CustomDateUtils";

export type StartBalanceCache = {
  [cacheKey: string]: number;
};

export type CalendarState = {
  days: number[];
  now: number;
  selected: number;
  startBalance: number;
  startBalanceCache: StartBalanceCache;
};

const initialState: CalendarState = {
  days: [],
  now: null,
  selected: null,
  startBalance: null,
  startBalanceCache: {},
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setNow(state, action: PayloadAction<number>) {
      const now = fromUnixTimeMs(action.payload);
      const stateNow = fromUnixTimeMs(state.now);

      const newMonth =
        state.now === null || now.getMonth() !== stateNow.getMonth();

      state.now = action.payload;

      if (!newMonth) {
        return;
      }

      const afterResult = FindDays(endOfMonth(now));

      const after: Date[] = [];

      const afterLength =
        getDaysInMonth(now) - now.getDate() + afterResult.after;
      4;
      for (let i = 0; i < afterLength; i++) {
        after.push(addDays(now, i + 1));
      }

      const before: Date[] = [];

      const beforeResult = FindDays(startOfMonth(now));

      const beforeLength = now.getDate() - 1 + beforeResult.before;

      for (let i = 0; i < beforeLength; i++) {
        before.push(subDays(now, i + 1));
      }

      before.reverse();

      state.days = [...before, now, ...after].map(getTime);
    },
    setSelected(state, action: PayloadAction<number>) {
      state.selected = action.payload;
    },
    setStartBalance(state, action: PayloadAction<number>) {
      const afterDate = fromUnixTimeMs(state.days[0]);
      const beforeDate = fromUnixTimeMs(state.days[state.days.length - 1]);
      if (!isValidDate(afterDate) || !isValidDate(beforeDate)) {
        return;
      }

      const key = `${format(afterDate, "dd/MM/yy")}-${format(
        beforeDate,
        "dd/MM/yy"
      )}`;

      state.startBalanceCache[key] = action.payload;
      state.startBalance = action.payload;
    },
  },
});

export const { setNow, setSelected, setStartBalance } = calendarSlice.actions;
export default calendarSlice.reducer;
