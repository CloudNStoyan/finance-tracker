import { Add, Delete, Remove } from "@mui/icons-material";
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
  SwipeableDrawer,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import TransactionPageStyled from "./styles/TransactionPage.styled";
import { LocalizationProvider } from "@mui/x-date-pickers";
import {
  Category,
  createOrEditTransaction,
  deleteTransaction,
  getCategories,
  getCategoryById,
  getTransactionById,
  Transaction,
} from "../server-api";
import axios from "axios";
import { setNotification } from "../state/notificationSlice";
import { Link, useParams } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import PickCategoryStyled from "../components/styles/PickCategory.styled";
import PickCategoriesStyled from "../components/styles/PickCategories.styled";

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

const TransactionPage: FunctionComponent<{ hasTransactionId: boolean }> = ({
  hasTransactionId,
}) => {
  const [transactionType, setTransactionType] = useState("expense");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(new Date());
  const [repeat, setRepeat] = useState("none");
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | undefined>();

  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);
  const { transactionId } = useParams();

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
    if (!hasTransactionId) {
      return;
    }

    const fetchTransaction = async () => {
      const resp = await getTransactionById(Number(transactionId));

      if (resp.status !== 200) {
        return;
      }

      const transaction = resp.data;

      if (transaction.categoryId !== null) {
        try {
          const catResp = await getCategoryById(transaction.categoryId);

          if (catResp.status !== 200) {
            return;
          }

          setCategory(catResp.data);
        } catch (error) {
          if (!axios.isAxiosError(error)) {
            return;
          }
        }
      }

      setValue(transaction.value.toString());
      setLabel(transaction.label);
      setConfirmed(transaction.confirmed);
      setTransactionType(transaction.type);
      setDate(transaction.transactionDate);
    };

    void fetchTransaction();
  }, [hasTransactionId, transactionId]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

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

    if (hasTransactionId) {
      transaction.transactionId = Number(transactionId);
    }

    if (category !== undefined) {
      transaction.categoryId = category.categoryId;
    }

    try {
      await createOrEditTransaction(transaction);
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }

    console.log(transaction);
  };

  const onDelete = async () => {
    if (!hasTransactionId) {
      return;
    }

    try {
      const resp = await deleteTransaction(Number(transactionId));

      if (resp.status !== 200) {
        return;
      }

      dispatch(
        setNotification({
          message: "Transaction deleted.",
          color: "success",
        })
      );
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }
  };

  return (
    <TransactionPageStyled
      bgColor={category != undefined ? category.bgColor : "rgb(82, 188, 232)"}
      isDarkMode={isDarkMode}
    >
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
        {hasTransactionId && (
          <IconButton
            onClick={() => void onDelete()}
            size="small"
            className="bg-red-500 text-gray-100 border-2 border-gray-400 delete-btn focus:scale-110"
          >
            <Delete />
          </IconButton>
        )}
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
          onClick={() => setDrawerIsOpen(true)}
          className="label-button justify-start normal-case"
          size="large"
          startIcon={
            category != undefined ? (
              Icons[category.icon]
            ) : (
              <LocalOfferOutlinedIcon />
            )
          }
        >
          {category != undefined ? category.name : "Uncategorized"}
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

        <SwipeableDrawer
          anchor={"bottom"}
          open={drawerIsOpen}
          onClose={() => setDrawerIsOpen(false)}
          onOpen={() => {}}
        >
          <PickCategoriesStyled>
            {categories.map((cat, idx) => (
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
            <Button>
              <Link to={"/categories"}>Manage categories</Link>
            </Button>
          </PickCategoriesStyled>
        </SwipeableDrawer>
      </div>
    </TransactionPageStyled>
  );
};

export default TransactionPage;
