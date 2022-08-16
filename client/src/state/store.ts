import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./mainSlice";
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";
import calendarReducer from "./calendarSlice";
import categoriesReducer from "./categorySlice";
import transactionsReducer from "./transactionSlice";

export const store = configureStore({
  reducer: {
    themeReducer,
    mainReducer,
    authReducer,
    notificationReducer,
    calendarReducer,
    categoriesReducer,
    transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
