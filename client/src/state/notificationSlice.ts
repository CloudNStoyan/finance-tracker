import { AlertColor } from "@mui/material";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  message: string;
  color: AlertColor;
}

export interface NotificationState {
  notification: Notification;
}

const initialState: NotificationState = {
  notification: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotification(state, action: PayloadAction<Notification>) {
      state.notification = action.payload;
    },
  },
});

export const { setNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
