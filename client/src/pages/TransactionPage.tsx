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
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import TransactionPageStyled from "./styles/TransactionPage.styled";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Category, deleteTransaction, Transaction } from "../server-api";
import axios from "axios";
import { setNotification } from "../state/notificationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import PickCategoryStyled from "../components/styles/PickCategory.styled";
import PickCategoriesStyled from "../components/styles/PickCategories.styled";
import { format, parseISO, parseJSON } from "date-fns";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import DefaultCategory from "../state/DefaultCategory";
import {
  addNewOrEditTransaction,
  addTransaction,
  editTransaction,
  fetchTransactionById,
  removeTransaction,
} from "../state/transactionSlice";
import RepeatTransactionDialog, {
  RepeatTransactionDialogOptions,
} from "../components/RepeatTransactionDialog";
import useQuery from "../infrastructure/useQuery";
import { fetchCategories } from "../state/categorySlice";

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

const TransactionPage: FunctionComponent<{
  hasTransactionId: boolean;
}> = ({ hasTransactionId }) => {
  const calendarSelected = useAppSelector(
    (state) => state.calendarReducer.selected
  );

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
  const [repeatEnd, setRepeatEnd] = useState(new Date());
  const [showRepeatEnd, setShowRepeatEnd] = useState(false);
  const [transactionIsARepeat, setTransactionIsARepeat] = useState(false);
  const [onlyThis, setOnlyThis] = useState<boolean>(null);
  const [showRepeatTransactionDialog, setShowRepeatTransactionDialog] =
    useState(false);
  const [itHasRepeat, setItHasRepeat] = useState(false);
  const [action, setAction] = useState<"update" | "delete">();

  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  const transactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const transactionsStatus = useAppSelector(
    (state) => state.transactionsReducer.fetchingStatus
  );

  const { transactionId } = useParams();
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (categoriesStatus !== "succeeded") {
      return;
    }

    setCategory(
      categories.find((c) => c.categoryId === categoryId) ?? DefaultCategory
    );
  }, [categories, categoryId, categoriesStatus]);

  useEffect(() => {
    if (!hasTransactionId || transactionIsLoaded) {
      return;
    }

    const transaction = transactions.find(
      (t) => t.transactionId === Number(transactionId)
    );

    if (!transaction && transactionsStatus === "idle") {
      void dispatch(fetchTransactionById(Number(transactionId)));
      return;
    }

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
      setItHasRepeat(transaction.repeat !== null);
      setRepeatEnd(
        transaction.repeatEnd === null
          ? new Date()
          : parseJSON(transaction.repeatEnd)
      );
      setShowRepeatEnd(transaction.repeatEnd !== null);

      const initialDateRaw = query.get("initialDate");
      if (initialDateRaw) {
        try {
          const initialDate = parseISO(initialDateRaw);
          console.log(initialDate);
          setDate(initialDate);
          setTransactionIsARepeat(true);
        } catch (error) {
          return;
        }
      }
    };

    if (transaction) {
      handleTransaction(transaction);
    }
  }, [
    dispatch,
    hasTransactionId,
    transactionId,
    transactionIsLoaded,
    transactions,
    transactionsStatus,
    query,
  ]);

  const handleDateChange = (newDate: Date | null) => {
    setDate(newDate);
  };

  const handleRepeatDateChange = (newDate: Date | null) => {
    setRepeatEnd(newDate);
  };

  const handleRepeatChange = (newRepeat: string) => {
    setRepeat(newRepeat);
  };

  useEffect(() => {
    if (onlyThis === null || action === null) {
      return;
    }

    if (action === "update") {
      void createOrEdit();
    }

    if (action === "delete") {
      void deleteTransactionCallback();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyThis, action]);

  const onSubmit = () => {
    if (!(Number(value) > 0 && label.trim().length > 0)) {
      dispatch(
        setNotification({
          message: "Value and Label must not be empty!",
          color: "error",
        })
      );
      return;
    }

    if (transactionIsARepeat || itHasRepeat) {
      setAction("update");
      setShowRepeatTransactionDialog(true);
    } else {
      void createOrEdit();
    }
  };

  const createOrEdit = async () => {
    const transactionRepeat =
      repeat === "weekly" || repeat === "monthly" || repeat === "yearly"
        ? repeat
        : null;

    const transaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: format(date, "yyyy-MM-dd"),
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

    if (showRepeatEnd && repeat !== "none") {
      transaction.repeatEnd = repeatEnd.toJSON();
    }

    const repeatMode =
      onlyThis === true
        ? "onlyThis"
        : onlyThis === false
        ? "thisAndForward"
        : null;

    try {
      await dispatch(
        addNewOrEditTransaction({
          transaction,
          repeatMode,
        })
      );

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const onDelete = () => {
    if (!hasTransactionId) {
      return;
    }

    if (transactionIsARepeat || itHasRepeat) {
      setAction("delete");
      setShowRepeatTransactionDialog(true);
    } else {
      void deleteTransactionCallback();
    }
  };

  const deleteTransactionCallback = async () => {
    try {
      const resp = await deleteTransaction(
        Number(transactionId),
        transactionIsARepeat && onlyThis === false,
        onlyThis,
        (transactionIsARepeat && onlyThis === false) || onlyThis === true
          ? date
          : null
      );

      if (resp.status !== 200) {
        return;
      }

      const transactionChanges = resp.data;

      transactionChanges.forEach((change) => {
        const ev = change.event;

        if (ev === "create") {
          dispatch(addTransaction(change.transaction));
        }

        if (ev === "update") {
          dispatch(editTransaction(change.transaction));
        }

        if (ev === "delete") {
          dispatch(removeTransaction(change.transaction.transactionId));
        }
      });

      navigate("/");
      dispatch(
        setNotification({
          message: "Transaction deleted.",
          color: "success",
        })
      );
    } catch (error) {
      console.error(error);
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
        <FormControl className="w-full justify-center items-end mt-2 pr-10">
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
            onClick={() => onDelete()}
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

        {repeat !== "none" && (
          <div className="repeat-end">
            <FormControlLabel
              control={
                <Switch
                  checked={showRepeatEnd}
                  onChange={(e) => setShowRepeatEnd(e.target.checked)}
                />
              }
              label="End"
              labelPlacement="start"
            />
            {showRepeatEnd && (
              <div>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <MobileDatePicker
                    className="border-none"
                    inputFormat="dd MMM yyyy"
                    value={repeatEnd}
                    onChange={handleRepeatDateChange}
                    renderInput={(params) => (
                      <div className="date-picker-render flex items-center">
                        {repeatEnd && (
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
                        )}
                      </div>
                    )}
                  />
                </LocalizationProvider>
              </div>
            )}
          </div>
        )}

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

        <RepeatTransactionDialog
          selectedValue={RepeatTransactionDialogOptions[0]}
          open={showRepeatTransactionDialog}
          onClose={(option) => {
            setShowRepeatTransactionDialog(false);
            setOnlyThis(option.value === "onlyThis");
          }}
        />
      </div>
    </TransactionPageStyled>
  );
};

export default TransactionPage;
