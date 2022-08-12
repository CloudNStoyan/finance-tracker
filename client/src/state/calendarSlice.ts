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
import { Category, Transaction } from "../server-api";

export type TransactionCache = {
  [cacheKey: string]: Transaction[];
};

export type CalendarState = {
  days: number[];
  now: number;
  selected: number;
  transactions: Transaction[];
  transactionCache: TransactionCache;
  categories: Category[];
};

const initialState: CalendarState = {
  days: [],
  now: null,
  selected: null,
  transactions: [],
  transactionCache: {},
  categories: [],
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
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      const key = format(fromUnixTimeMs(state.now), "yyyy-MMMM");

      state.transactionCache[key] = action.payload;
      state.transactions = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      let now = fromUnixTimeMs(state.now);
      if (!isValidDate(now)) {
        now = new Date();
      }

      const key = format(now, "yyyy-MMMM");

      state.transactions.push(action.payload);
      state.transactionCache[key] = state.transactions;
    },
    editTransaction(state, action: PayloadAction<Transaction>) {
      let now = fromUnixTimeMs(state.now);
      if (!isValidDate(now)) {
        now = new Date();
      }

      const key = format(now, "yyyy-MMMM");

      state.transactions = [
        action.payload,
        ...state.transactions.filter(
          (x) => x.transactionId !== action.payload.transactionId
        ),
      ];
      state.transactionCache[key] = state.transactions;
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
  },
});

export const {
  setNow,
  setTransactions,
  setSelected,
  setCategories,
  addTransaction,
  editTransaction,
} = calendarSlice.actions;
export default calendarSlice.reducer;
