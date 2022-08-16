import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addDays,
  endOfMonth,
  getDaysInMonth,
  getTime,
  startOfMonth,
  subDays,
} from "date-fns";
import { FindDays, fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import { Transaction } from "../server-api";

export type TransactionCache = {
  [cacheKey: string]: Transaction[];
};

export type CalendarState = {
  days: number[];
  now: number;
  selected: number;
};

const initialState: CalendarState = {
  days: [],
  now: null,
  selected: null,
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
  },
});

export const { setNow, setSelected } = calendarSlice.actions;
export default calendarSlice.reducer;
