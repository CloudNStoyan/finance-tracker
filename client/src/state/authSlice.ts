import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getMe, loginV2, register, ServerError, User } from "../server-api";

export type AuthCredentials = {
  username: string;
  password: string;
  recaptchaToken: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  user?: User;
  status: "loading" | "succeeded" | "failed" | "idle";
  error: string;
  sessionKey: string;
  checkedSession: boolean;
};

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  status: "idle",
  sessionKey: null,
  error: null,
  checkedSession: false,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const httpResponse = await getMe();
  return httpResponse.data;
});

export const sendLogin = createAsyncThunk(
  "auth/sendLogin",
  async (loginCredentials: AuthCredentials): Promise<[string, User]> => {
    const httpResponse = await loginV2(
      loginCredentials.username,
      loginCredentials.password,
      loginCredentials.recaptchaToken
    );

    if ("sessionKey" in httpResponse) {
      return [httpResponse.sessionKey, { username: loginCredentials.username }];
    }

    return [httpResponse.error, null];
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
        state.checkedSession = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = "failed";
        state.checkedSession = true;
      })
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
      });
    builder
      .addCase(
        sendLogin.fulfilled,
        (state, action: PayloadAction<[string, User]>) => {
          const [data, user] = action.payload;

          if (user === null) {
            state.status = "failed";
            state.error = data;
            return;
          }

          state.sessionKey = data;
          state.user = user;
          state.status = "succeeded";
          state.isLoggedIn = true;
          state.error = null;
        }
      )
      .addCase(sendLogin.rejected, (state) => {
        state.error = "General error";
        state.status = "failed";
      })
      .addCase(sendLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
    builder.addCase(
      sendRegister.fulfilled,
      (state, action: PayloadAction<AxiosResponse<ServerError>>) => {
        if (!axios.isAxiosError(action.payload)) {
          return;
        }

        const serverError = action.payload as AxiosError<ServerError>;
        state.error = serverError.response.data.error;
      }
    );
  },
});

export const { setUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
