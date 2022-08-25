import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import { getTransactionsBeforeAndAfterDate, Transaction } from "../server-api";

export type TransactionState = {
  transactions: Transaction[];
  completedTansactionQueries: string[];
  fetchingStatus: "idle" | "loading";
};

const initialState: TransactionState = {
  transactions: [],
  completedTansactionQueries: [],
  fetchingStatus: "idle",
};

export const fetchTransactionsByRange = createAsyncThunk(
  "transactions/fetchTransactionsByRange",
  async ({
    after,
    before,
    now,
  }: {
    after: Date;
    before: Date;
    now: number;
  }) => {
    const resp = await getTransactionsBeforeAndAfterDate(after, before);

    return { transactions: resp.data, now };
  }
);

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
  extraReducers(builder) {
    builder
      .addCase(
        fetchTransactionsByRange.fulfilled,
        (
          state,
          action: PayloadAction<{ transactions: Transaction[]; now: number }>
        ) => {
          state.fetchingStatus = "idle";

          const query = format(fromUnixTimeMs(action.payload.now), "yyyy-MMMM");
          state.completedTansactionQueries.push(query);

          const transactions = action.payload.transactions;

          state.transactions = [
            ...transactions.filter(
              (transaction) =>
                state.transactions.findIndex(
                  (t) => t.transactionId === transaction.transactionId
                ) === -1
            ),
            ...state.transactions,
          ];
        }
      )
      .addCase(fetchTransactionsByRange.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchTransactionsByRange.rejected, (state) => {
        state.fetchingStatus = "idle";
      });
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
