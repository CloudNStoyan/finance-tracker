import { configureStore } from "@reduxjs/toolkit";
import basicReducer from "./basicSlice";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    themeReducer,
    basicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
