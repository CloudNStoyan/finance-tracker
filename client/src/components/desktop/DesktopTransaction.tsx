import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  styled,
  TextField,
} from "@mui/material";
import {
  Add,
  Delete,
  Remove,
  ScheduleOutlined,
  LoopOutlined,
} from "@mui/icons-material";
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import DesktopTransactionStyled from "../styles/desktop/DesktopTransaction.styled";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import PickCategoryStyled from "../styles/PickCategory.styled";
import DefaultCategory from "../../state/DefaultCategory";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { fromUnixTimeMs } from "../../infrastructure/CustomDateUtils";
import {
  Category,
  createOrEditTransaction,
  deleteTransaction,
  getCategories,
  Transaction,
} from "../../server-api";
import axios from "axios";
import { format, parseJSON } from "date-fns";
import { setNotification } from "../../state/notificationSlice";
import { addTransaction, editTransaction } from "../../state/calendarSlice";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Icons from "../../infrastructure/Icons";
import DesktopPickCategoriesStyled from "../styles/desktop/DesktopPickCategories.styled";

export type DesktopTransactionProps = {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
};

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

const DesktopTransaction: FunctionComponent<DesktopTransactionProps> = ({
  open,
  onClose,
  transaction,
}) => {
  const modalBodyRef = useRef();
  const calendarSelected = useAppSelector(
    (state) => state.calendarReducer.selected
  );

  const [transactionType, setTransactionType] = useState("expense");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(
    fromUnixTimeMs(calendarSelected) ?? new Date()
  );
  const [dateInputOpen, setDateInputOpen] = useState(false);
  const [repeat, setRepeat] = useState("none");
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | undefined>();

  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        setCategories(resp.data);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);

  useEffect(() => {
    if (!transaction) {
      return;
    }

    setValue(transaction.value.toString());
    setLabel(transaction.label);
    setConfirmed(transaction.confirmed);
    setTransactionType(transaction.type);
    setDate(parseJSON(transaction.transactionDate));
    setCategory(
      categories.find((cat) => cat.categoryId === transaction.categoryId)
    );
  }, [transaction, categories]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const handleRepeatChange = (newRepeat: string) => {
    setRepeat(newRepeat);
  };

  const onSubmit = async () => {
    if (Number(value) === 0 || label.trim().length === 0) {
      dispatch(
        setNotification({
          message: "Value and Label must not be empty!",
          color: "error",
        })
      );
      return;
    }

    const newTransaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: format(date, "yyyy-MM-dd") + "T00:00:00",
      type: transactionType === "income" ? "income" : "expense",
      confirmed,
    };

    if (transaction) {
      newTransaction.transactionId = Number(transaction.transactionId);
    }

    if (category !== undefined) {
      newTransaction.categoryId = category.categoryId;
    }

    try {
      const resp = await createOrEditTransaction(newTransaction);

      if (resp.status === 201) {
        dispatch(addTransaction(resp.data));
      } else if (resp.status === 200) {
        dispatch(editTransaction(newTransaction));
      }

      onClose();
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }
  };

  const onDelete = async () => {
    if (!transaction) {
      return;
    }

    try {
      const resp = await deleteTransaction(Number(transaction.transactionId));

      if (resp.status !== 200) {
        return;
      }

      dispatch(
        setNotification({
          message: "Transaction deleted.",
          color: "success",
        })
      );

      onClose();
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      container={() => document.getElementById("app")}
      PaperProps={{
        style: { borderRadius: 0 },
      }}
    >
      <DialogContent className="p-0 relative" ref={modalBodyRef}>
        <DesktopTransactionStyled
          bgColor={
            category != undefined ? category.bgColor : DefaultCategory.bgColor
          }
          isDarkMode={isDarkMode}
        >
          <div className="relative fields">
            <div className="m-2 flex items-end">
              <IconButton
                className="text-white"
                onClick={() => {
                  setTransactionType(
                    transactionType === "expense" ? "income" : "expense"
                  );
                }}
              >
                {transactionType === "expense" ? <Remove /> : <Add />}
              </IconButton>
              <CustomTextField
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (isNaN(Number(inputValue)) && inputValue.length > 0) {
                    return;
                  }

                  setValue(inputValue.trim());
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value;

                  if (isNaN(Number(inputValue)) && inputValue.length > 0) {
                    return;
                  }

                  setValue(inputValue.trim());
                }}
                value={value}
                variant="standard"
                className="transaction-value"
                InputLabelProps={{ shrink: true }}
                label="Value"
                placeholder="0.00"
              />
              <CustomTextField
                InputLabelProps={{ shrink: true }}
                placeholder="e.g netflix"
                label="Label"
                variant="standard"
                className="ml-4"
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
              onClick={() => setDrawerIsOpen(true)}
              className="label-button justify-start normal-case"
              size="large"
              startIcon={
                category != undefined
                  ? Icons[category.icon]
                  : Icons[DefaultCategory.icon]
              }
            >
              {category != undefined ? category.name : "Uncategorized"}
            </Button>
            <div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  inputFormat="dd MMM yyy"
                  disableMaskedInput={true}
                  value={date}
                  onChange={handleDateChange}
                  open={dateInputOpen}
                  onClose={() => setDateInputOpen(false)}
                  renderInput={(params) => (
                    <div className="date-picker-render flex items-center">
                      <TextField
                        {...params}
                        variant="standard"
                        size="small"
                        className="date-picker-input"
                        InputProps={{
                          startAdornment: (
                            <IconButton
                              className="p-0"
                              onClick={() => setDateInputOpen(true)}
                            >
                              <ScheduleOutlined className="date-picker-icon" />
                            </IconButton>
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
              <LoopOutlined className="icon" />
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
          <div className="p-2 w-full flex">
            {transaction && (
              <IconButton
                onClick={() => void onDelete()}
                className="text-red-500"
              >
                <Delete />
              </IconButton>
            )}
            <Button
              onClick={() => void onSubmit()}
              className="block ml-auto"
              variant="contained"
            >
              {transaction ? "Save" : "Create"}
            </Button>
          </div>
          <Dialog
            open={drawerIsOpen}
            onClose={() => setDrawerIsOpen(false)}
            container={() => modalBodyRef.current}
          >
            <DialogContent className="p-0">
              <DesktopPickCategoriesStyled>
                <div className="cats">
                  {[...categories, DefaultCategory].map((cat, idx) => (
                    <PickCategoryStyled key={idx} bgColor={cat.bgColor}>
                      <button
                        className="wrapper"
                        onClick={() => {
                          setCategory(cat);
                          setDrawerIsOpen(false);
                        }}
                      >
                        <div className="icon">{Icons[cat.icon]}</div>
                        <h4>{cat.name}</h4>
                      </button>
                    </PickCategoryStyled>
                  ))}
                </div>
                <Button className="w-full">
                  <Link to={"/categories"}>Manage categories</Link>
                </Button>
              </DesktopPickCategoriesStyled>
            </DialogContent>
          </Dialog>
        </DesktopTransactionStyled>
      </DialogContent>
    </Dialog>
  );
};

export default DesktopTransaction;
