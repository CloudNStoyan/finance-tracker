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
  AppBar,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  styled,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import TransactionPageStyled from "./styles/TransactionPage.styled";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Category, Transaction } from "../server-api";
import { setNotification } from "../state/notificationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import PickCategoryStyled from "../components/styles/PickCategory.styled";
import PickCategoriesStyled from "../components/styles/PickCategories.styled";
import { parseISO, parseJSON } from "date-fns";
import {
  DateOnlyToString,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import DefaultCategory from "../state/DefaultCategory";
import {
  addNewOrEditTransaction,
  fetchTransactionById,
  deleteTransaction,
} from "../state/transactionSlice";
import RepeatTransactionDialog, {
  OptionType,
  OptionValue,
} from "../components/RepeatTransactionDialog";
import useQuery from "../infrastructure/useQuery";
import { fetchCategories } from "../state/categorySlice";
import DeleteTransactionDialog from "../components/DeleteDialog";

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
  const [showRepeatTransactionDialog, setShowRepeatTransactionDialog] =
    useState(false);
  const [repeatTransactionDialogCallback, setRepeatTransactionDialogCallback] =
    useState<(option: OptionType) => void>();
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogCallback, setDeleteTransactionDialogCallback] =
    useState<(option: boolean) => void>();
  const [itHasRepeat, setItHasRepeat] = useState(false);

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
          setDate(initialDate);
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

    if (itHasRepeat) {
      setShowRepeatTransactionDialog(true);

      const callback = (option: OptionType) => {
        if (!option) {
          return;
        }

        void createOrEdit(option.value);
      };

      setRepeatTransactionDialogCallback(() => callback);
    } else {
      void createOrEdit();
    }
  };

  const createOrEdit = async (repeatMode?: OptionValue) => {
    const transactionRepeat =
      repeat === "weekly" || repeat === "monthly" || repeat === "yearly"
        ? repeat
        : null;

    const transaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: DateOnlyToString(date),
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
      transaction.repeatEnd = DateOnlyToString(repeatEnd);
    }

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

    if (itHasRepeat) {
      setShowRepeatTransactionDialog(true);

      const callback = (option: OptionType) => {
        if (!option) {
          return;
        }

        void deleteTransactionCallback(option.value);
      };

      setRepeatTransactionDialogCallback(() => callback);
    } else {
      setDeleteTransactionDialogOpen(true);

      const callback = (option: boolean) => {
        if (!option) {
          return;
        }

        void deleteTransactionCallback();
      };

      setDeleteTransactionDialogCallback(() => callback);
    }
  };

  const deleteTransactionCallback = async (repeatMode?: OptionValue) => {
    try {
      await dispatch(
        deleteTransaction({
          transactionId: Number(transactionId),
          repeatMode,
          date,
        })
      );

      navigate("/");
      dispatch(
        setNotification({
          message: "Transaction deleted.",
          color: "success",
        })
      );
    } catch (error) {
      console.error(error);
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
            InputLabelProps={{ shrink: true }}
            label="Value"
            placeholder="0.00"
          />
          <CustomTextField
            label="Label"
            InputLabelProps={{ shrink: true }}
            placeholder="e.g netflix"
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
          className="confirmed-label"
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
        <div className="date-picker-container">
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
          <div className="description-container relative grow w-full flex flex-col mt-2">
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

        <Dialog
          fullScreen
          open={drawerIsOpen}
          onClose={() => setDrawerIsOpen(false)}
          container={() => document.querySelector("#app > #wrapper")}
        >
          <PickCategoriesStyled>
            <AppBar className="dark:bg-[#7b1fa2]" sx={{ position: "relative" }}>
              <Toolbar sx={{ minHeight: "50px" }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setDrawerIsOpen(false)}
                >
                  <Close />
                </IconButton>
                <Typography
                  sx={{ ml: 2, flex: 1 }}
                  variant="h6"
                  component="div"
                >
                  Select category
                </Typography>
              </Toolbar>
            </AppBar>
            <div className="cat-wrapper">
              <div className="cat-container">
                {[...categories, DefaultCategory].map((cat) => (
                  <PickCategoryStyled
                    key={cat.categoryId ?? "default"}
                    bgColor={cat.bgColor}
                  >
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
              <Button className="manage-cat-btn">
                <Link to={"/categories"}>Manage categories</Link>
              </Button>
            </div>
          </PickCategoriesStyled>
        </Dialog>

        <RepeatTransactionDialog
          open={showRepeatTransactionDialog}
          onClose={(option) => {
            setShowRepeatTransactionDialog(false);

            if (repeatTransactionDialogCallback) {
              repeatTransactionDialogCallback(option);
              setRepeatTransactionDialogCallback(null);
            }
          }}
        />
        <DeleteTransactionDialog
          type="transaction"
          open={deleteTransactionDialogOpen}
          onClose={(option) => {
            setDeleteTransactionDialogOpen(false);

            if (deleteTransactionDialogCallback) {
              deleteTransactionDialogCallback(option);
              setDeleteTransactionDialogCallback(null);
            }
          }}
        />
      </div>
    </TransactionPageStyled>
  );
};

export default TransactionPage;
