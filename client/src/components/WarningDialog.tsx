import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FunctionComponent } from "react";
import { useAppDispatch } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";

export interface WarningDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
  title: string;
}

const DATE_WARNING_KEY = "28th_date_warning";

export const GetMonthlyDateWarning = () => {
  const warningValue = localStorage.getItem(DATE_WARNING_KEY);

  if (warningValue !== null) {
    return JSON.parse(warningValue) === true;
  }

  return true;
};

const WarningDialog: FunctionComponent<WarningDialogProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const handleNeverShowAgain = () => {
    try {
      localStorage.setItem(DATE_WARNING_KEY, JSON.stringify(false));
    } catch {
      dispatch(
        setNotification({
          message: "Coulnd't save the preference",
          color: "warning",
        })
      );
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Transaction may not occur properly</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Transactions after the 28th may occur at the last day of the month
          instead of transaction date, because not every month has more than 28
          days.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Ok</Button>
        <Button onClick={handleNeverShowAgain}>Never show this again</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
