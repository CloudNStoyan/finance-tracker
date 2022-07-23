import { configureStore } from "@reduxjs/toolkit";
import basicReducer from "./basicSlice";

export const store = configureStore({
  reducer: {
    basicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
