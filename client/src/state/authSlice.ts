import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe, User } from "../server-api";

export type AuthState = {
  isLoggedIn: boolean;
  user?: User;
  status: "loading" | "succeeded" | "failed" | "idle";
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  status: "idle",
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const httpResponse = await getMe();
  return httpResponse.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.status = "succeeded";
    },
    logoutUser(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.status = "succeeded";
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      });
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
