import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getMe, login, User } from "../server-api";

type LoginCredentials = {
  username: string;
  password: string;
  recaptchaToken: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user?: User;
  status: "loading" | "succeeded" | "failed" | "idle";
  sessionKey: string;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  status: "idle",
  sessionKey: null,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const httpResponse = await getMe();
  return httpResponse.data;
});

export const sendLogin = createAsyncThunk(
  "auth/sendLogin",
  async (loginCredentials: LoginCredentials) => {
    const httpResponse = await login(
      loginCredentials.username,
      loginCredentials.password,
      loginCredentials.recaptchaToken
    );

    const sessionKey: string = httpResponse.data;

    return sessionKey;
  }
);

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
    builder.addCase(
      sendLogin.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.sessionKey = action.payload;
      }
    );
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
