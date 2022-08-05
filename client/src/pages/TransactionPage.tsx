import { Add, Remove } from "@mui/icons-material";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  styled,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import TransactionPageStyled from "./styles/TransactionPage.styled";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { createOrEditTransaction, Transaction } from "../server-api";
import axios from "axios";
import { setNotification } from "../state/notificationSlice";

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& label.Mui-focused ": {
    color: "white",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "white",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "white",
  },
  "& label": {
    color: "white",
  },
});

const TransactionPage = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);
  const [transactionType, setTransactionType] = useState("expense");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [confirmed, setConfirmed] = useState(true);

  const [date, setDate] = useState<Date | null>(new Date());

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const [repeat, setRepeat] = useState("none");

  const handleRepeatChange = (newRepeat: string) => {
    setRepeat(newRepeat);
  };

  const onSubmit = async () => {
    if (!(Number(value) > 0 && label.trim().length > 0)) {
      dispatch(
        setNotification({
          message: "Value and Label must not be empty!",
          color: "error",
        })
      );
      return;
    }

    const transaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: date,
      type: transactionType === "income" ? "income" : "expense",
      confirmed,
    };

    try {
      await createOrEditTransaction(transaction);
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }

    console.log(transaction);
  };

  return (
    <TransactionPageStyled bgColor="purple" isDarkMode={isDarkMode}>
      <div className="relative fields">
        <FormControl className="w-full justify-center items-center mt-2">
          <RadioGroup
            row
            name="transaction-type-group"
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <FormControlLabel
              value={"expense"}
              control={<Radio hidden />}
              label="Expense"
              checked={transactionType === "expense"}
            />
            <FormControlLabel
              value="income"
              control={<Radio hidden />}
              label="Income"
              checked={transactionType === "income"}
            />
          </RadioGroup>
        </FormControl>
        <IconButton
          onClick={() => void onSubmit()}
          size="large"
          className="dark:bg-purple-500 text-white bg-blue-500 save-btn focus:scale-110"
        >
          <CheckIcon />
        </IconButton>
        <div className="m-2 flex items-end">
          <CustomTextField
            onChange={(e) => setValue(e.target.value)}
            onBlur={(e) => setValue(e.target.value)}
            value={value}
            type="number"
            variant="standard"
            className="transaction-value"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" className="text-white">
                  {transactionType === "expense" ? <Remove /> : <Add />}
                </InputAdornment>
              ),
            }}
          />
          <CustomTextField
            label="Label"
            variant="standard"
            className="ml-4 transaction-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={(e) => setLabel(e.target.value)}
          />
        </div>
      </div>
      <div className="transaction-info">
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          }
          label="Confirmed"
        />
        <Button
          className="label-button justify-start normal-case"
          size="large"
          startIcon={<LocalOfferOutlinedIcon />}
        >
          Uncategorized
        </Button>
        <div>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <MobileDatePicker
              className="border-none"
              inputFormat="DD MMM yyyy"
              value={date}
              onChange={handleDateChange}
              renderInput={(params) => (
                <div className="date-picker-render flex items-center">
                  <TextField
                    {...params}
                    variant="standard"
                    size="small"
                    className="date-picker-input"
                    InputProps={{
                      startAdornment: (
                        <ScheduleOutlinedIcon className="date-picker-icon" />
                      ),
                      disableUnderline: true,
                    }}
                  />
                </div>
              )}
            />
          </LocalizationProvider>
        </div>

        <div className="repeat-selector-wrapper">
          <LoopOutlinedIcon className="icon" />
          <Select
            variant="standard"
            className="repeat-select"
            value={repeat}
            onChange={(e) => handleRepeatChange(e.target.value)}
            label="Age"
            sx={{ border: 0 }}
          >
            <MenuItem value={"none"}>Does not repeat</MenuItem>
            <MenuItem value={"week"}>Repeat every week</MenuItem>
            <MenuItem value={"month"}>Repeat every month</MenuItem>
            <MenuItem value={"year"}>Repeat every year</MenuItem>
          </Select>
        </div>
      </div>
    </TransactionPageStyled>
  );
};

export default TransactionPage;
