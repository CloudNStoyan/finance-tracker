import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  AuthError,
  getMe,
  login,
  LoginResponse,
  register,
  ServerError,
  User,
} from "../server-api";

export interface AuthCredentials {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  user?: User;
  status: "loading" | "succeeded" | "failed" | "idle";
  error: AuthError;
  sessionKey: string;
  checkedSession: boolean;
  verificationToken: string;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
  status: "idle",
  error: null,
  sessionKey: null,
  checkedSession: false,
  verificationToken: null,
};

export const fetchMe = createAsyncThunk("auth/fetchMe", async () => {
  const httpResponse = await getMe();
  return httpResponse.data;
});

export const sendLogin = createAsyncThunk(
  "auth/sendLogin",
  async (
    loginCredentials: AuthCredentials
  ): Promise<LoginResponse | ServerError<AuthError>> => {
    const httpResponse = await login(
      loginCredentials.email,
      loginCredentials.password,
      loginCredentials.recaptchaToken
    );

    return httpResponse;
  }
);

export const sendRegister = createAsyncThunk(
  "auth/sendRegister",
  async (authCredentials: AuthCredentials) => {
    return await register(
      authCredentials.email,
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
    setVerificationToken(state, action: PayloadAction<string>) {
      state.verificationToken = action.payload;
    },
    logoutUser(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
    clearError(state) {
      state.error = null;
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
        (
          state,
          action: PayloadAction<LoginResponse | ServerError<AuthError>>
        ) => {
          const data = action.payload;

          if ("sessionKey" in data) {
            state.user = data.user;
            state.sessionKey = data.sessionKey;
            state.status = "succeeded";
            state.isLoggedIn = true;
            state.error = null;
            return;
          }

          state.status = "failed";
          state.error = data.error;
        }
      )
      .addCase(sendLogin.rejected, (state) => {
        state.error = "GeneralError";
        state.status = "failed";
      })
      .addCase(sendLogin.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
    builder
      .addCase(
        sendRegister.fulfilled,
        (state, action: PayloadAction<number>) => {
          const statusCode = action.payload;

          if (statusCode !== 200) {
            state.error = "GeneralError";
            state.status = "failed";
            return;
          }

          state.status = "succeeded";
        }
      )
      .addCase(sendRegister.rejected, (state) => {
        state.error = "GeneralError";
        state.status = "failed";
      })
      .addCase(sendRegister.pending, (state) => {
        state.status = "loading";
        state.error = null;
      });
  },
});

export const { setUser, logoutUser, clearError, setVerificationToken } =
  authSlice.actions;
export default authSlice.reducer;
