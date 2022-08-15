import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../server-api";

export type AuthState = {
  triedToAuth: boolean;
  isLoggedIn: boolean;
  user?: User;
};

const initialState: AuthState = {
  triedToAuth: false,
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
    triedToAuth(state) {
      state.triedToAuth = true;
    },
    logoutUser(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { setUser, triedToAuth, logoutUser } = authSlice.actions;
export default authSlice.reducer;
