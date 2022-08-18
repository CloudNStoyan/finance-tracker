import {
  Add,
  Close,
  Delete,
  DescriptionOutlined,
  Remove,
} from "@mui/icons-material";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { MobileDatePicker } from "@mui/x-date-pickers/";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import LoopOutlinedIcon from "@mui/icons-material/LoopOutlined";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  styled,
  SwipeableDrawer,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
  getTransactionById,
  Transaction,
} from "../server-api";
import axios from "axios";
import { setNotification } from "../state/notificationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import PickCategoryStyled from "../components/styles/PickCategory.styled";
import PickCategoriesStyled from "../components/styles/PickCategories.styled";
import { format, parseJSON } from "date-fns";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import DefaultCategory from "../state/DefaultCategory";
import { setCategories } from "../state/categorySlice";
import {
  addTransaction,
  editTransaction,
  removeTransaction,
} from "../state/transactionSlice";

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
  const calendarSelected = useAppSelector(
    (state) => state.calendarReducer.selected
  );

  const [isFetchingTransaction, setIsFetchingTransaction] = useState(false);
  const [transactionIsLoaded, setTransactionIsLoaded] = useState(false);
  const [transactionType, setTransactionType] = useState("expense");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(true);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(
    fromUnixTimeMs(calendarSelected) ?? new Date()
  );
  const [description, setDescription] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [openDescription, setOpenDescription] = useState(false);
  const [repeat, setRepeat] = useState("none");
  const [category, setCategory] = useState<Category | undefined>();

  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );
  const transactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const { transactionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (categories.length > 0) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setCategories(resp.data));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [categories, dispatch]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    setCategory(
      categories.find((c) => c.categoryId === categoryId) ?? DefaultCategory
    );
  }, [categories, categoryId]);

  useEffect(() => {
    if (!hasTransactionId || transactionIsLoaded || isFetchingTransaction) {
      return;
    }

    setIsFetchingTransaction(true);

    const handleTransaction = (transaction: Transaction) => {
      setValue(transaction.value.toString());
      setLabel(transaction.label);
      setConfirmed(transaction.confirmed);
      setTransactionType(transaction.type);
      setDate(parseJSON(transaction.transactionDate));
      setCategoryId(transaction.categoryId);
      setRepeat(transaction.repeat ?? "none");
      setTransactionIsLoaded(true);
      setDescription(transaction.details ?? "");
      setEditableDescription(transaction.details ?? "");
    };

    const fetchTransaction = async () => {
      try {
        const resp = await getTransactionById(Number(transactionId));

        if (resp.status !== 200) {
          return;
        }

        const transaction = resp.data;

        handleTransaction(transaction);
        if (transactions.length > 0) {
          dispatch(addTransaction(transaction));
        }
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }

        if (error.response.status === 404) {
          dispatch(
            setNotification({
              message: "No transaction with that ID.",
              color: "error",
            })
          );
          navigate("/transaction");
        }
      } finally {
        setIsFetchingTransaction(false);
      }
    };

    const transaction = transactions.find(
      (t) => t.transactionId === Number(transactionId)
    );

    if (!transaction) {
      void fetchTransaction();
      return;
    }

    handleTransaction(transaction);
  }, [
    hasTransactionId,
    transactionId,
    transactions,
    categories,
    transactionIsLoaded,
    isFetchingTransaction,
    dispatch,
    navigate,
  ]);

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

    const transactionRepeat =
      repeat === "weekly" || repeat === "monthly" || repeat === "yearly"
        ? repeat
        : null;

    const transaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: format(date, "yyyy-MM-dd") + "T00:00:00",
      type: transactionType === "income" ? "income" : "expense",
      confirmed,
      repeat: transactionRepeat,
      details: description,
    };

    if (hasTransactionId) {
      transaction.transactionId = Number(transactionId);
    }

    if (category !== undefined) {
      transaction.categoryId = category.categoryId;
    }

    try {
      const resp = await createOrEditTransaction(transaction);

      if (resp.status === 201) {
        dispatch(addTransaction(resp.data));
      } else if (resp.status === 200) {
        dispatch(editTransaction(transaction));
      }

      navigate("/");
      return;
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return;
      }
    }
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

      dispatch(removeTransaction(Number(transactionId)));
      navigate("/");
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
      bgColor={
        category != undefined ? category.bgColor : DefaultCategory.bgColor
      }
      isDarkMode={isDarkMode}
    >
      <div className="relative fields">
        <FormControl className="w-full justify-center items-end mt-2 pr-4">
          <ToggleButtonGroup
            className="type-selector"
            color="primary"
            size="small"
            value={transactionType}
            exclusive
            onChange={(e, v: "expense" | "income") => {
              if (v === null) {
                return;
              }

              setTransactionType(v);
            }}
          >
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
          </ToggleButtonGroup>
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
            className="ml-4 transaction-label grow"
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
            <MobileDatePicker
              className="border-none"
              inputFormat="dd MMM yyyy"
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
            sx={{ border: 0 }}
          >
            <MenuItem value={"none"}>Does not repeat</MenuItem>
            <MenuItem value={"weekly"}>Repeat every week</MenuItem>
            <MenuItem value={"monthly"}>Repeat every month</MenuItem>
            <MenuItem value={"yearly"}>Repeat every year</MenuItem>
          </Select>
        </div>

        {!openDescription && (
          <Button
            onClick={() => setOpenDescription(true)}
            size="large"
            className="label-button justify-start normal-case"
            startIcon={<DescriptionOutlined />}
          >
            <span className="description-btn-text">
              {description.trim().length === 0
                ? "Add description"
                : description}
            </span>
          </Button>
        )}

        {openDescription && (
          <div className="relative grow w-full flex flex-col mt-2">
            <IconButton
              color="primary"
              className="absolute top-0 right-0"
              onClick={() => setOpenDescription(false)}
            >
              <Close />
            </IconButton>
            <textarea
              value={editableDescription}
              onChange={(e) => setEditableDescription(e.target.value)}
              className="description-input p-2 outline-0 w-full border-2 grow"
            ></textarea>
            <Button
              className="mt-2"
              onClick={() => {
                setDescription(editableDescription);
                setOpenDescription(false);
              }}
            >
              Done
            </Button>
          </div>
        )}

        <SwipeableDrawer
          anchor={"bottom"}
          open={drawerIsOpen}
          onClose={() => setDrawerIsOpen(false)}
          onOpen={() => {}}
        >
          <PickCategoriesStyled>
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
