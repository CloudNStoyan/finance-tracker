import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
import { getStartBalanceByMonth, Balance } from "../server-api";

export type StartBalanceCache = {
  [cacheKey: string]: number;
};

export type CalendarState = {
  days: number[];
  now: number;
  selected: number;
  startBalance: number;
  startBalanceCache: StartBalanceCache;
  fetchingStatus: "idle" | "loading" | "succeeded";
  firstDayOfTheMonth: "monday" | "sunday";
};

const getFirstDayOfTheMonthPreference = () => {
  const preference = localStorage.getItem("first_day_of_month_preference");

  if (preference === "sunday") {
    return "sunday";
  }

  return "monday";
};

const initialState: CalendarState = {
  days: [],
  now: null,
  selected: null,
  startBalance: null,
  startBalanceCache: {},
  fetchingStatus: "idle",
  firstDayOfTheMonth: getFirstDayOfTheMonthPreference(),
};

export const fetchStartBalance = createAsyncThunk(
  "calendar/fetchStartBalance",
  async (date: Date) => {
    const resp = await getStartBalanceByMonth(date);

    return resp.data;
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setFirstDayOfTheMonth(state, action: PayloadAction<"monday" | "sunday">) {
      state.firstDayOfTheMonth = action.payload;
    },
    setNow(state, action: PayloadAction<number>) {
      state.fetchingStatus = "idle";

      const now = fromUnixTimeMs(action.payload);
      const stateNow = fromUnixTimeMs(state.now);

      const newMonth =
        state.now === null || now.getMonth() !== stateNow.getMonth();

      state.now = action.payload;

      if (!newMonth) {
        return;
      }

      const afterResult = FindDays(
        endOfMonth(now),
        state.firstDayOfTheMonth === "monday"
      );

      const after: Date[] = [];

      const afterLength =
        getDaysInMonth(now) - now.getDate() + afterResult.after;
      4;
      for (let i = 0; i < afterLength; i++) {
        after.push(addDays(now, i + 1));
      }

      const before: Date[] = [];

      const beforeResult = FindDays(
        startOfMonth(now),
        state.firstDayOfTheMonth === "monday"
      );

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
  extraReducers(builder) {
    builder
      .addCase(fetchStartBalance.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchStartBalance.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(
        fetchStartBalance.fulfilled,
        (state, action: PayloadAction<Balance>) => {
          state.fetchingStatus = "succeeded";

          const afterDate = fromUnixTimeMs(state.days[0]);
          const beforeDate = fromUnixTimeMs(state.days[state.days.length - 1]);
          if (!isValidDate(afterDate) || !isValidDate(beforeDate)) {
            return;
          }

          const key = `${format(afterDate, "dd/MM/yy")}-${format(
            beforeDate,
            "dd/MM/yy"
          )}`;

          state.startBalanceCache[key] = action.payload.balance;
          state.startBalance = action.payload.balance;
        }
      );
  },
});

export const { setNow, setSelected, setStartBalance, setFirstDayOfTheMonth } =
  calendarSlice.actions;
export default calendarSlice.reducer;
