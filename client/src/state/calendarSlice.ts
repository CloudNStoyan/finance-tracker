import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import {
  fromUnixTimeMs,
  GetCalendarInDays,
  isValidDate,
} from "../infrastructure/CustomDateUtils";
import { getStartBalanceByMonth, FetchStatus } from "../server-api";
import { logoutUser } from "./authSlice";

export interface StartBalanceCache {
  [cacheKey: string]: number;
}

export interface CalendarState {
  days: number[];
  now: number;
  selected: number;
  startBalance: number;
  startBalanceCache: StartBalanceCache;
  searchValue: string;
  fetchingStatus: FetchStatus;
  firstDayOfTheMonth: "monday" | "sunday";
}

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
  searchValue: "",
  fetchingStatus: "idle",
  firstDayOfTheMonth: getFirstDayOfTheMonthPreference(),
};

export const fetchStartBalance = createAsyncThunk(
  "calendar/fetchStartBalance",
  async (date: Date) => {
    const httpResponse = await getStartBalanceByMonth(date);

    return httpResponse.data;
  }
);

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSearchValue(state, action: PayloadAction<string>) {
      state.searchValue = action.payload;
    },
    setFirstDayOfTheMonth(state, action: PayloadAction<"monday" | "sunday">) {
      state.firstDayOfTheMonth = action.payload;

      state.days = GetCalendarInDays(
        new Date(state.now),
        state.firstDayOfTheMonth === "monday"
      );
    },
    setNow(state, action: PayloadAction<number>) {
      state.fetchingStatus = "idle";

      const now = fromUnixTimeMs(action.payload);
      const stateNow = fromUnixTimeMs(state.now);

      const newMonth =
        state.now === null ||
        now.getMonth() !== stateNow.getMonth() ||
        now.getFullYear() !== stateNow.getFullYear();

      state.now = action.payload;

      if (!newMonth) {
        return;
      }

      state.days = GetCalendarInDays(
        now,
        state.firstDayOfTheMonth === "monday"
      );
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
    builder.addCase(logoutUser, (state) => {
      state.days = initialState.days;
      state.fetchingStatus = initialState.fetchingStatus;
      state.firstDayOfTheMonth = initialState.firstDayOfTheMonth;
      state.now = initialState.now;
      state.selected = initialState.selected;
      state.startBalance = initialState.startBalance;
      state.startBalanceCache = initialState.startBalanceCache;
    });
    builder
      .addCase(fetchStartBalance.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchStartBalance.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(fetchStartBalance.fulfilled, (state, action) => {
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
      });
  },
});

export const {
  setNow,
  setSelected,
  setStartBalance,
  setFirstDayOfTheMonth,
  setSearchValue,
} = calendarSlice.actions;
export default calendarSlice.reducer;
