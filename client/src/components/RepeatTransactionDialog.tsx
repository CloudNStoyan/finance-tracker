import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import { FunctionComponent } from "react";
import { ListItemButton } from "@mui/material";

export const RepeatTransactionDialogOptions: OptionType[] = [
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
    value: "thisAndForward",
  },
];

export interface OptionType {
  title: string;
  content: string;
  value: RepeatModeOptionValue;
}

export type RepeatModeOptionValue = "onlyThis" | "thisAndForward";

export interface RepeatTransactionDialogProps {
  open: boolean;
  onClose: (value: OptionType) => void;
}

interface RepeatTransactionOptionProps {
  onClick: (option: OptionType) => void;
  option: OptionType;
}

const RepeatTransactionOption: FunctionComponent<
  RepeatTransactionOptionProps
> = ({ onClick, option }) => {
  const handleClick = () => onClick(option);

  return (
    <ListItemButton onClick={handleClick}>
      <ListItemText primary={option.title} />
    </ListItemButton>
  );
};

function RepeatTransactionDialog(props: RepeatTransactionDialogProps) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose(null);
  };

  const handleListItemClick = (option: OptionType) => {
    onClose(option);
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
          <RepeatTransactionOption
            onClick={handleListItemClick}
            option={option}
            key={option.value}
          />
        ))}
      </List>
    </Dialog>
  );
}

export default RepeatTransactionDialog;
