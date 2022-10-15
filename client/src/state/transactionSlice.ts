import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import {
  createOrEditTransaction,
  getTransactionById,
  getTransactionsBeforeAndAfterDate,
  Transaction,
  TransactionEvent,
  deleteTransaction as deleteTransactionApi,
} from "../server-api";

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

export const fetchTransactionById = createAsyncThunk(
  "transactions/fetchTransactionById",
  async (transactionId: number) => {
    const resp = await getTransactionById(transactionId);

    return resp.data;
  }
);

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

export const addNewOrEditTransaction = createAsyncThunk(
  "transactions/addNewOrEditTransaction",
  async ({
    transaction,
    repeatMode,
  }: {
    transaction: Transaction;
    repeatMode?: "onlyThis" | "thisAndForward";
  }) => {
    if (!repeatMode) {
      const resp = await createOrEditTransaction(transaction);

      return resp.data;
    }

    const resp = await createOrEditTransaction(transaction, repeatMode);

    return resp.data;
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async ({
    transactionId,
    repeatMode,
    date,
  }: {
    transactionId: number;
    repeatMode?: "onlyThis" | "thisAndForward";
    date?: string;
  }) => {
    if (!repeatMode) {
      const resp = await deleteTransactionApi(transactionId);

      return resp.data;
    }

    const resp = await deleteTransactionApi(transactionId, repeatMode, date);

    return resp.data;
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
      })
      .addCase(
        fetchTransactionById.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.fetchingStatus = "idle";

          const stateHasTransaction =
            state.transactions.findIndex(
              (t) => t.transactionId === action.payload.transactionId
            ) !== -1;

          if (stateHasTransaction) {
            return;
          }

          state.transactions.push(action.payload);
        }
      )
      .addCase(fetchTransactionById.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchTransactionById.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(
        addNewOrEditTransaction.fulfilled,
        (state, action: PayloadAction<TransactionEvent[]>) => {
          state.fetchingStatus = "idle";
          const changes = action.payload;

          changes.forEach((change) => {
            const ev = change.event;
            const transaction = change.transaction;

            if (ev === "create") {
              const stateHasTransaction =
                state.transactions.findIndex(
                  (t) => t.transactionId === transaction.transactionId
                ) !== -1;

              if (!stateHasTransaction) {
                state.transactions.push(transaction);
              }
            }

            if (ev === "update") {
              state.transactions = [
                transaction,
                ...state.transactions.filter(
                  (x) => x.transactionId !== transaction.transactionId
                ),
              ];
            }

            if (ev === "delete") {
              state.transactions = state.transactions.filter(
                (t) => t.transactionId !== transaction.transactionId
              );
            }
          });
        }
      )
      .addCase(addNewOrEditTransaction.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(addNewOrEditTransaction.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(
        deleteTransaction.fulfilled,
        (state, action: PayloadAction<TransactionEvent[]>) => {
          state.fetchingStatus = "idle";
          const changes = action.payload;

          changes.forEach((change) => {
            const ev = change.event;
            const transaction = change.transaction;

            if (ev === "create") {
              const stateHasTransaction =
                state.transactions.findIndex(
                  (t) => t.transactionId === transaction.transactionId
                ) !== -1;

              if (!stateHasTransaction) {
                state.transactions.push(transaction);
              }
            }

            if (ev === "update") {
              state.transactions = [
                transaction,
                ...state.transactions.filter(
                  (x) => x.transactionId !== transaction.transactionId
                ),
              ];
            }

            if (ev === "delete") {
              state.transactions = state.transactions.filter(
                (t) => t.transactionId !== transaction.transactionId
              );
            }
          });
        }
      )
      .addCase(deleteTransaction.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(deleteTransaction.rejected, (state) => {
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
