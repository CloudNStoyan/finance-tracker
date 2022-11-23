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
  const handleClose = (v: boolean) => {
    onClose(v);
  };

  return (
    <Dialog open={open} onClose={() => handleClose(null)}>
      <DialogTitle>Delete {type}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deleting a {type} cannot be undone. Are you still sure about it?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
        <Button color="error" onClick={() => handleClose(true)}>
          YES, DELETE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
