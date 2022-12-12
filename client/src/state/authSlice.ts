import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getMe, login, register, ServerError, User } from "../server-api";

type AuthCredentials = {
  username: string;
  password: string;
  recaptchaToken: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user?: User;
  status: "loading" | "succeeded" | "failed" | "idle";
  registerError: string;
  sessionKey: string;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  status: "idle",
  sessionKey: null,
  registerError: null,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const httpResponse = await getMe();
  return httpResponse.data;
});

export const sendLogin = createAsyncThunk(
  "auth/sendLogin",
  async (loginCredentials: AuthCredentials) => {
    const httpResponse = await login(
      loginCredentials.username,
      loginCredentials.password,
      loginCredentials.recaptchaToken
    );

    const sessionKey: string = httpResponse.data.sessionKey;

    return sessionKey;
  }
);

export const sendRegister = createAsyncThunk(
  "auth/sendRegister",
  async (authCredentials: AuthCredentials) => {
    return await register(
      authCredentials.username,
      authCredentials.password,
      authCredentials.recaptchaToken
    );
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
    builder.addCase(
      sendRegister.fulfilled,
      (state, action: PayloadAction<AxiosResponse<ServerError>>) => {
        if (!axios.isAxiosError(action.payload)) {
          return;
        }

        const serverError = action.payload as AxiosError<ServerError>;
        state.registerError = serverError.response.data.error;
      }
    );
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
