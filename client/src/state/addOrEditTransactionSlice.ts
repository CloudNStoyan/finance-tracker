import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { parseJSON } from "date-fns";
import { GetNextTransactionOccurrenceDate } from "../infrastructure/TransactionsBuisnessLogic";
import {
  Category,
  Transaction,
  TransactionRepeatType,
  TransactionType,
} from "../server-api";

export interface AddOrEditTransactionState {
  label: string;
  value: number;
  transactionDate: number;
  confirmed: boolean;
  type: TransactionType;
  category?: Category;
  description?: string;
  transactionId?: number;
  repeat?: TransactionRepeatType;
  repeatEvery?: number;
  repeatEndType?: "on" | "after";
  repeatEndDate?: number;
  repeatEndOccurrences?: number;
}

const initialState: AddOrEditTransactionState = {
  label: null,
  value: null,
  transactionDate: null,
  confirmed: false,
  type: "expense",
  category: null,
  repeat: null,
  repeatEvery: null,
  repeatEndType: null,
  repeatEndDate: null,
  repeatEndOccurrences: null,
};

const addOrEditTransactionSlice = createSlice({
  name: "addOrEditTransaction",
  initialState,
  reducers: {
    setTransactionLabel(state, action: PayloadAction<string>) {
      state.label = action.payload;
    },
    setTransactionValue(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
    setTransactionDate(state, action: PayloadAction<number>) {
      state.transactionDate = action.payload;
    },
    setTransactionConfirmed(state, action: PayloadAction<boolean>) {
      state.confirmed = action.payload;
    },
    setTransactionType(state, action: PayloadAction<TransactionType>) {
      state.type = action.payload;
    },
    setTransactionCategory(state, action: PayloadAction<Category>) {
      state.category = action.payload;
    },
    setTransactionRepeat(state, action: PayloadAction<TransactionRepeatType>) {
      state.repeat = action.payload;

      if (state.repeatEvery === null) {
        state.repeatEvery = 1;
      }
    },
    setTransactionRepeatEvery(state, action: PayloadAction<number>) {
      state.repeatEvery = action.payload;
    },
    setTransactionRepeatEndType(state, action: PayloadAction<"on" | "after">) {
      if (action.payload === "on" && state.repeatEndDate === null) {
        state.repeatEndDate = GetNextTransactionOccurrenceDate(
          state.transactionDate,
          state.repeat,
          state.repeatEvery
        );
      }

      if (action.payload === "after" && state.repeatEndOccurrences === null) {
        state.repeatEndOccurrences = 1;
      }

      state.repeatEndType = action.payload;
    },
    setTransactionRepeatEndOccurrencess(state, action: PayloadAction<number>) {
      state.repeatEndOccurrences = action.payload;
    },
    setTransactionRepeatEndDate(state, action: PayloadAction<number>) {
      state.repeatEndDate = action.payload;
    },
    setTransactionDescription(state, action: PayloadAction<string>) {
      state.description = action.payload;
    },
    loadTransaction(
      state,
      action: PayloadAction<[Transaction, Category, number]>
    ) {
      const [transaction, category, calendarSelected] = action.payload;

      state.transactionId = transaction.transactionId;
      state.value = transaction.value;
      state.label = transaction.label;
      state.confirmed = transaction.confirmed;
      state.type = transaction.type;
      state.transactionDate = transaction.repeat
        ? calendarSelected
        : parseJSON(transaction.transactionDate).getTime();

      state.category = category;
      state.description = transaction.details;
      state.repeatEndType = transaction.repeatEndType;
      state.repeat = transaction.repeat;
      state.repeatEvery = transaction.repeatEvery;
      state.repeatEndOccurrences = transaction.repeatEndOccurrences;

      if (transaction.repeatEndType === "on") {
        state.repeatEndDate = parseJSON(transaction.repeatEndDate).getTime();
      }
    },
    clearTransactionState: () => initialState,
  },
});

export const {
  loadTransaction,
  setTransactionLabel,
  setTransactionValue,
  setTransactionDate,
  setTransactionConfirmed,
  setTransactionType,
  setTransactionCategory,
  setTransactionRepeat,
  setTransactionRepeatEndType,
  setTransactionRepeatEndOccurrencess,
  setTransactionRepeatEndDate,
  setTransactionDescription,
  clearTransactionState,
  setTransactionRepeatEvery,
} = addOrEditTransactionSlice.actions;
export default addOrEditTransactionSlice.reducer;
