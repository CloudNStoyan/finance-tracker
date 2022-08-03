import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../server-api";

export type AuthState = {
  isLoggedIn: boolean;
  user?: User;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
