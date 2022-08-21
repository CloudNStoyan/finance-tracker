import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";

export const RepeatTransactionDialogOptions = [
  {
    title: "Only this transaction",
    content:
      "This particular transaction will be changed. The other transactions in the series won't be affected.",
    value: "onlyThis",
  },
  {
    title: "This and all following transactions",
    content:
      "This and all the following transactions in the series will be changed.",
    value: "thisAndFollowing",
  },
];

type OptionType = {
  title: string;
  content: string;
  value: string;
};

export interface RepeatTransactionDialogProps {
  open: boolean;
  selectedValue: OptionType;
  onClose: (value: OptionType) => void;
}

function RepeatTransactionDialog(props: RepeatTransactionDialogProps) {
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(RepeatTransactionDialogOptions.find((o) => o.value === value));
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Change transaction</DialogTitle>
      <DialogContent>
        Would you like to change this particular transaction or all the
        following transactions too?
      </DialogContent>
      <List sx={{ pt: 0 }}>
        {RepeatTransactionDialogOptions.map((option) => (
          <ListItem
            button
            onClick={() => handleListItemClick(option.value)}
            key={option.value}
          >
            <ListItemText primary={option.title} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

export default RepeatTransactionDialog;
