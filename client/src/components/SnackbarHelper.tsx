import { SyntheticEvent, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { useAppSelector } from "../state/hooks";
import { Alert, AlertColor } from "@mui/material";

export interface SnackbarMessage {
  message: string;
  color: AlertColor;
}

const SnackbarHelper = () => {
  const notification = useAppSelector(
    (state) => state.notificationReducer.notification
  );
  const [snackPack, setSnackPack] = useState<readonly SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | undefined>(
    undefined
  );

  useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  useEffect(() => {
    if (notification === null) {
      return;
    }

    setSnackPack((prev) => [...prev, notification]);
  }, [notification]);

  const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleExited = () => {
    setMessageInfo(undefined);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      TransitionProps={{ onExited: handleExited }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={messageInfo?.color}
        sx={{ width: "100%" }}
      >
        {messageInfo ? messageInfo.message : undefined}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarHelper;
