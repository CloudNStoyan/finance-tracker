import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { format } from "date-fns";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import {
  createOrEditTransaction,
  getTransactionById,
  getTransactionsBeforeAndAfterDate,
  Transaction,
  deleteTransaction as deleteTransactionApi,
  FetchStatus,
  getTransactionsBySearch,
} from "../server-api";
import { logoutUser } from "./authSlice";

export interface TransactionState {
  transactions: Transaction[];
  completedTansactionQueries: string[];
  searchQueries: string[];
  fetchingStatus: FetchStatus;
  addOrEditTransactionStatus: FetchStatus;
  deleteTransactionStatus: FetchStatus;
  searchTransactionStatus: FetchStatus;
  lastSearchQuery: string;
}

const initialState: TransactionState = {
  transactions: [],
  completedTansactionQueries: [],
  searchQueries: [],
  fetchingStatus: "idle",
  addOrEditTransactionStatus: "idle",
  deleteTransactionStatus: "idle",
  searchTransactionStatus: "idle",
  lastSearchQuery: null,
};

export const fetchTransactionById = createAsyncThunk(
  "transactions/fetchTransactionById",
  async (transactionId: number) => {
    const httpResponse = await getTransactionById(transactionId);

    return httpResponse.data;
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
    const httpResponse = await getTransactionsBeforeAndAfterDate(after, before);

    return { transactions: httpResponse.data, now };
  }
);

export const fetchTransactionsByQuery = createAsyncThunk(
  "transactions/fetchTransactionsByQuery",
  async ({ search }: { search: string }) => {
    const httpResponse = await getTransactionsBySearch(search);

    return { transactions: httpResponse.data, query: search };
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
      const httpResponse = await createOrEditTransaction(transaction);

      return httpResponse.data;
    }

    const httpResponse = await createOrEditTransaction(transaction, repeatMode);

    return httpResponse.data;
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
    date?: Date;
  }) => {
    if (!repeatMode) {
      const httpResponse = await deleteTransactionApi(transactionId);

      return httpResponse.data;
    }

    const httpResponse = await deleteTransactionApi(
      transactionId,
      repeatMode,
      date
    );

    return httpResponse.data;
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
    addSearchQuery(state, action: PayloadAction<string>) {
      state.searchQueries.push(action.payload);
      state.lastSearchQuery = action.payload;
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
    editTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions = [
        action.payload,
        ...state.transactions.filter(
          (x) => x.transactionId !== action.payload.transactionId
        ),
      ];
    },
    resetAddOrEditTransactionStatus(state) {
      state.addOrEditTransactionStatus = "idle";
    },
    resetDeleteTransactionStatus(state) {
      state.deleteTransactionStatus = "idle";
    },
  },
  extraReducers(builder) {
    builder.addCase(logoutUser, (state) => {
      state.completedTansactionQueries =
        initialState.completedTansactionQueries;
      state.fetchingStatus = initialState.fetchingStatus;
      state.transactions = initialState.transactions;
    });
    builder
      .addCase(fetchTransactionsByRange.fulfilled, (state, action) => {
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
      })
      .addCase(fetchTransactionsByRange.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchTransactionsByRange.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.fetchingStatus = "idle";

        const stateHasTransaction =
          state.transactions.findIndex(
            (t) => t.transactionId === action.payload.transactionId
          ) !== -1;

        if (stateHasTransaction) {
          return;
        }

        state.transactions.push(action.payload);
      })
      .addCase(fetchTransactionById.pending, (state) => {
        state.fetchingStatus = "loading";
      })
      .addCase(fetchTransactionById.rejected, (state) => {
        state.fetchingStatus = "idle";
      })
      .addCase(addNewOrEditTransaction.fulfilled, (state, action) => {
        state.addOrEditTransactionStatus = "succeeded";
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
      })
      .addCase(addNewOrEditTransaction.pending, (state) => {
        state.addOrEditTransactionStatus = "loading";
      })
      .addCase(addNewOrEditTransaction.rejected, (state) => {
        state.addOrEditTransactionStatus = "failed";
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.deleteTransactionStatus = "succeeded";
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
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.deleteTransactionStatus = "loading";
      })
      .addCase(deleteTransaction.rejected, (state) => {
        state.deleteTransactionStatus = "failed";
      })
      .addCase(fetchTransactionsByQuery.fulfilled, (state, action) => {
        const { query, transactions } = action.payload;

        if (query === state.lastSearchQuery) {
          state.searchTransactionStatus = "succeeded";
        }

        state.transactions = [
          ...transactions.filter(
            (transaction) =>
              state.transactions.findIndex(
                (t) => t.transactionId === transaction.transactionId
              ) === -1
          ),
          ...state.transactions,
        ];
      })
      .addCase(fetchTransactionsByQuery.pending, (state) => {
        state.searchTransactionStatus = "loading";
      })
      .addCase(fetchTransactionsByQuery.rejected, (state) => {
        state.searchTransactionStatus = "failed";
      });
  },
});

export const {
  setTransactions,
  removeTransaction,
  addTransaction,
  editTransaction,
  addTransactions,
  addSearchQuery,
  resetAddOrEditTransactionStatus,
  resetDeleteTransactionStatus,
} = transactionsSlice.actions;
export default transactionsSlice.reducer;
