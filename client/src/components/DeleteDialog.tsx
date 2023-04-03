import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FunctionComponent } from "react";

export interface DeleteDialogProps {
  open: boolean;
  onClose: (value: boolean) => void;
  type: string;
}

const DeleteDialog: FunctionComponent<DeleteDialogProps> = ({
  open,
  onClose,
  type,
}) => {
  const onCancel = () => {
    onClose(false);
  };

  const onAccept = () => {
    onClose(true);
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete {type}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting a {type} cannot be undone. Are you still sure about it?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" onClick={onAccept}>
          YES, DELETE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
