import { configureStore } from "@reduxjs/toolkit";
import mainReducer from "./mainSlice";
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    themeReducer,
    mainReducer,
    authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
