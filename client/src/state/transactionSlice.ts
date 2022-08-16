import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "../server-api";

export type TransactionState = {
  transactions: Transaction[];
  completedTansactionQueries: string[];
};

const initialState: TransactionState = {
  transactions: [],
  completedTansactionQueries: [],
};

const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
    },
    removeTransaction(state, action: PayloadAction<number>) {
      state.transactions = state.transactions.filter(
        (t) => t.transactionId !== action.payload
      );
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      const stateHasTransaction =
        state.transactions.findIndex(
          (t) => t.transactionId === action.payload.transactionId
        ) !== -1;

      if (stateHasTransaction) {
        return;
      }

      state.transactions.push(action.payload);
    },
    addTransactions(state, action: PayloadAction<Transaction[]>) {
      const transactions = action.payload;

      state.transactions = [
        ...transactions.filter(
          (transaction) =>
            state.transactions.findIndex(
              (t) => t.transactionId === transaction.transactionId
            ) === -1
        ),
        ...state.transactions,
      ];
    },
    addQuery(state, action: PayloadAction<string>) {
      state.completedTansactionQueries.push(action.payload);
    },
    editTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions = [
        action.payload,
        ...state.transactions.filter(
          (x) => x.transactionId !== action.payload.transactionId
        ),
      ];
    },
  },
});

export const {
  setTransactions,
  removeTransaction,
  addTransaction,
  editTransaction,
  addTransactions,
  addQuery,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
