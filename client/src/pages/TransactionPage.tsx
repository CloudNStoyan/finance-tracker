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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import TransactionPageStyled from "./TransactionPage.styled";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Transaction, TransactionRepeatType } from "../server-api";
import { setNotification } from "../state/notificationSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import PickCategoryStyled from "../components/PickCategory.styled";
import PickCategoriesStyled from "../components/PickCategories.styled";
import { parseISO } from "date-fns";
import { DateOnlyToString } from "../infrastructure/CustomDateUtils";
import DefaultCategory from "../state/DefaultCategory";
import {
  addNewOrEditTransaction,
  fetchTransactionById,
  deleteTransaction,
  resetAddOrEditTransactionStatus,
  resetDeleteTransactionStatus,
} from "../state/transactionSlice";
import RepeatTransactionDialog, {
  OptionType,
  RepeatModeOptionValue,
} from "../components/RepeatTransactionDialog";
import useQuery from "../infrastructure/useQuery";
import { fetchCategories } from "../state/categorySlice";
import DeleteTransactionDialog from "../components/DeleteDialog";
import HorizontalSelect, {
  HorizontalSelectValue,
} from "../components/HorizontalSelect";
import RepeatSummary from "../components/RepeatSummary";
import {
  loadTransaction,
  setTransactionCategory,
  setTransactionDate,
  setTransactionDescription,
  setTransactionRepeat,
  setTransactionRepeatEndDate,
  setTransactionRepeatEndOccurrencess,
  setTransactionRepeatEndType,
  setTransactionRepeatEvery,
  setTransactionValue,
  setTransactionType,
  setTransactionLabel,
  setTransactionConfirmed,
} from "../state/addOrEditTransactionSlice";
import { CustomChangeEvent } from "../infrastructure/Utils";
import WarningDialog from "../components/WarningDialog";
import LoadingCircleAnimation from "../components/LoadingCircleAnimation";

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

const DefaultRepeatMenuState = (
  repeat?: TransactionRepeatType,
  repeatEvery?: number
) => {
  if (!repeat) {
    return "none";
  }

  if (repeatEvery === 1) {
    return repeat;
  }

  return "custom";
};

const RepeatTypeSelectValues = [
  { value: "daily", text: "Day" },
  { value: "weekly", text: "Week" },
  { value: "monthly", text: "Month" },
  { value: "yearly", text: "Year" },
];

const RepeatEndTypeSelectValues = [
  { value: "never", text: "Never" },
  { value: "on", text: "On" },
  { value: "after", text: "After" },
];

const TransactionPage: FunctionComponent<{
  hasTransactionId: boolean;
}> = ({ hasTransactionId }) => {
  const calendarSelected = useAppSelector(
    (state) => state.calendarReducer.selected
  );
  const {
    category,
    description,
    repeatEvery,
    repeatEndOccurrences,
    repeat,
    repeatEndType,
    repeatEndDate,
    value,
    label,
    confirmed,
    transactionId,
  } = useAppSelector((state) => state.addOrEditTransactionReducer);

  const transactionDateInNumber = useAppSelector(
    (state) => state.addOrEditTransactionReducer.transactionDate
  );

  const transactionDate = useMemo(
    () => new Date(transactionDateInNumber),
    [transactionDateInNumber]
  );

  const transactionType = useAppSelector(
    (state) => state.addOrEditTransactionReducer.type
  );

  const [editableDescription, setEditableDescription] = useState("");
  const [openDescription, setOpenDescription] = useState(false);
  const [repeatMenu, setRepeatMenu] = useState(
    DefaultRepeatMenuState(repeat, repeatEvery)
  );
  const [selectCategoryDialogOpen, setSelectCategoryDialogOpen] =
    useState(false);
  const [repeatTransactionDialogOpen, setRepeatTransactionDialogOpen] =
    useState(false);
  const [repeatTransactionDialogCallback, setRepeatTransactionDialogCallback] =
    useState<(option: OptionType) => void>();
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogCallback, setDeleteTransactionDialogCallback] =
    useState<(option: boolean) => void>();
  const [error, setError] = useState<string>(null);
  const [valueError, setValueError] = useState(false);
  const [labelError, setLabelError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);

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

  const { addOrEditTransactionStatus, deleteTransactionStatus } =
    useAppSelector((state) => state.transactionsReducer);

  const transactionsStatus = useAppSelector(
    (state) => state.transactionsReducer.fetchingStatus
  );

  const loadTransactionStatus = useRef("idle");

  const params = useParams();
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    if (
      !params.transactionId ||
      loadTransactionStatus.current !== "idle" ||
      categoriesStatus !== "succeeded"
    ) {
      return;
    }

    if (transactionsStatus === "idle") {
      void dispatch(fetchTransactionById(Number(params.transactionId)));
      return;
    }

    const transaction = transactions.find(
      (t) => t.transactionId === Number(params.transactionId)
    );

    const cat =
      categories.find((c) => c.categoryId === transaction.categoryId) ??
      DefaultCategory;

    const initialDateRaw = query.get("initialDate");
    let initialDate;
    if (initialDateRaw) {
      try {
        initialDate = parseISO(initialDateRaw).getTime();
      } catch (error) {
        // we want to surpress this error because its
        // very easy to trigger and it doesnt give any value
      }
    }

    dispatch(
      loadTransaction([transaction, cat, initialDate ?? calendarSelected])
    );
  }, [
    params,
    category,
    categoriesStatus,
    calendarSelected,
    categories,
    dispatch,
    transactions,
    transactionsStatus,
    query,
  ]);

  useEffect(() => {
    if (transactionId) {
      return;
    }

    dispatch(setTransactionDate(calendarSelected));
  }, [calendarSelected, transactionId, dispatch]);

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  const handleDateChange = (newDate: Date | null) => {
    dispatch(setTransactionDate(newDate.getTime()));
  };

  const handleRepeatDateChange = (newDate: Date | null) => {
    if (repeatEndType !== "on") {
      return;
    }

    setTransactionRepeatEndDate(newDate.getTime());
  };

  const handleRepeatMenuChange = (e: CustomChangeEvent) => {
    const repeatMenuOption = e.target.value;

    setRepeatMenu(repeatMenuOption);

    if (
      repeatMenuOption === "daily" ||
      repeatMenuOption === "weekly" ||
      repeatMenuOption === "monthly" ||
      repeatMenuOption === "yearly"
    ) {
      dispatch(setTransactionRepeat(repeatMenuOption));
      dispatch(setTransactionRepeatEvery(1));
    }
  };

  const handleRepeatEveryChange = (e: CustomChangeEvent) => {
    const inputValue = e.target.value;

    if (isNaN(Number(inputValue)) && inputValue.length > 0) {
      return;
    }

    let newRepeatEveryCount = Number(inputValue.trim());

    if (newRepeatEveryCount < 1) {
      newRepeatEveryCount = 1;
    }

    if (newRepeatEveryCount > 99) {
      newRepeatEveryCount = 99;
    }

    dispatch(setTransactionRepeatEvery(newRepeatEveryCount));
  };

  const handleRepeatEndOccurrencesChange = (e: CustomChangeEvent) => {
    const inputValue = e.target.value;
    if (isNaN(Number(inputValue)) && inputValue.length > 0) {
      return;
    }
    let newRepeatEndOccurrences = Number(inputValue.trim());
    if (newRepeatEndOccurrences < 1) {
      newRepeatEndOccurrences = 1;
    }
    if (newRepeatEndOccurrences > 99) {
      newRepeatEndOccurrences = 99;
    }

    dispatch(setTransactionRepeatEndOccurrencess(newRepeatEndOccurrences));
  };

  const handleRepeatEndTypeChange = (
    selected: HorizontalSelectValue<"never" | "on" | "after">
  ) => {
    if (selected.value === "never") {
      dispatch(setTransactionRepeatEndType(null));
      return;
    }

    dispatch(setTransactionRepeatEndType(selected.value));
  };

  const handleRepeatChange = (
    selected: HorizontalSelectValue<TransactionRepeatType>
  ) => dispatch(setTransactionRepeat(selected.value));

  const handleTransactionValueChange = (e: CustomChangeEvent) => {
    const inputValue = e.target.value;

    if (isNaN(Number(inputValue)) && inputValue.length > 0) {
      return;
    }

    let newValue = Number(inputValue?.trim());

    if (newValue === 0) {
      newValue = null;
    }

    dispatch(setTransactionValue(newValue));
  };

  const handleEditableDescriptionChange = (e: CustomChangeEvent) =>
    setEditableDescription(e.target.value);

  const handleSelectCategoryClicked = () => {
    setSelectCategoryDialogOpen(true);
  };

  const handleTransactionTypeChange = () =>
    dispatch(
      setTransactionType(transactionType === "expense" ? "income" : "expense")
    );

  const handleTransactionLabelChange = (e: CustomChangeEvent) =>
    dispatch(setTransactionLabel(e.target.value));

  const handleTransactionConfirmedChange = (e: CustomChangeEvent) =>
    dispatch(setTransactionConfirmed(e.target.checked));

  const handleRepeatTransactionDialogClose = (option: OptionType) => {
    setRepeatTransactionDialogOpen(false);

    if (repeatTransactionDialogCallback) {
      repeatTransactionDialogCallback(option);
      setRepeatTransactionDialogCallback(null);
    }
  };

  const handleDeleteTransactionDialogClose = (option: boolean) => {
    setDeleteTransactionDialogOpen(false);

    if (deleteTransactionDialogCallback) {
      deleteTransactionDialogCallback(option);
      setDeleteTransactionDialogCallback(null);
    }
  };

  const handleWarningDialogClose = () => {
    setWarningDialogOpen(false);
  };

  useEffect(() => {
    if (value === 0) {
      return;
    }

    setValueError(false);
  }, [value]);

  useEffect(() => {
    if (!label || label.length === 0) {
      return;
    }

    setLabelError(false);
  }, [label]);

  useEffect(() => {
    switch (addOrEditTransactionStatus) {
      case "succeeded":
        dispatch(
          setNotification({
            message: "Transaction created.",
            color: "success",
          })
        );
        console.log("closing?");
        dispatch(resetAddOrEditTransactionStatus());
        return;
      case "failed":
        dispatch(
          setNotification({
            message: "General error!",
            color: "error",
          })
        );
        setError("General error! Please try again later.");
        dispatch(resetAddOrEditTransactionStatus());
        return;
      case "idle":
        return;
      case "loading":
        return;
    }
  }, [addOrEditTransactionStatus, dispatch]);

  useEffect(() => {
    switch (deleteTransactionStatus) {
      case "succeeded":
        dispatch(
          setNotification({
            message: "Transaction deleted.",
            color: "success",
          })
        );
        navigate("/");
        dispatch(resetDeleteTransactionStatus());
        return;
      case "failed":
        dispatch(
          setNotification({
            message: "General error!",
            color: "error",
          })
        );
        setError("General error! Please try again later.");
        dispatch(resetDeleteTransactionStatus());
        return;
      case "idle":
        return;
      case "loading":
        return;
    }
  }, [deleteTransactionStatus, dispatch, navigate]);

  const onSubmit = () => {
    const valueIsInvalid = value < 1;
    const labelIsInvalid = !label || label.trim().length === 0;

    if (valueIsInvalid) {
      setValueError(true);
    }

    if (labelIsInvalid) {
      setLabelError(true);
    }

    if (valueIsInvalid || labelIsInvalid) {
      return;
    }

    if (addOrEditTransactionStatus === "loading") {
      return;
    }

    setError(null);

    setLoading(true);

    if (repeatMenu !== "none" && transactionId) {
      setRepeatTransactionDialogOpen(true);
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

  const createOrEdit = async (repeatMode?: RepeatModeOptionValue) => {
    const newTransaction: Transaction = {
      label: label,
      value: value,
      transactionDate: DateOnlyToString(transactionDate),
      type: transactionType,
      confirmed,
    };

    if (repeat) {
      newTransaction.repeat = repeat;
      newTransaction.repeatEndType = repeatEndType;
      newTransaction.repeatEvery = repeatEvery;

      if (repeatEndType === "after") {
        newTransaction.repeatEndOccurrences = repeatEndOccurrences;
      }

      if (repeatEndType === "on") {
        newTransaction.repeatEndDate = DateOnlyToString(
          new Date(repeatEndDate)
        );
      }
    }

    if (description && description.length > 0) {
      newTransaction.details = description;
    }

    if (transactionId) {
      newTransaction.transactionId = transactionId;
    }

    if (category) {
      newTransaction.categoryId = category.categoryId;
    }

    try {
      await dispatch(
        addNewOrEditTransaction({
          transaction: newTransaction,
          repeatMode,
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = () => {
    if (!transactionId || deleteTransactionStatus !== "idle") {
      return;
    }

    setLoading(true);

    if (repeatMenu !== "none") {
      setRepeatTransactionDialogOpen(true);

      const callback = (option: OptionType) => {
        if (!option) {
          setLoading(false);
          return;
        }

        void deleteTransactionCallback(option.value);
      };

      setRepeatTransactionDialogCallback(() => callback);
    } else {
      setDeleteTransactionDialogOpen(true);

      const callback = (option: boolean) => {
        if (!option) {
          setLoading(false);
          return;
        }

        void deleteTransactionCallback();
      };

      setDeleteTransactionDialogCallback(() => callback);
    }
  };

  const deleteTransactionCallback = async (
    repeatMode?: RepeatModeOptionValue
  ) => {
    try {
      await dispatch(
        deleteTransaction({
          transactionId: Number(transactionId),
          repeatMode,
          date: new Date(transactionDate),
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionPageStyled
      bgColor={
        category != undefined ? category.bgColor : DefaultCategory.bgColor
      }
      isDarkMode={isDarkMode}
      isLoading={loading}
    >
      <div className="relative fields">
        {loading && <LoadingCircleAnimation className="loading-wrapper" />}
        <FormControl className="w-full justify-center items-end mt-2 pr-10">
          <ToggleButtonGroup
            className="type-selector"
            color="primary"
            size="small"
            value={transactionType}
            exclusive
            onChange={handleTransactionTypeChange}
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
            onChange={handleTransactionValueChange}
            onBlur={handleTransactionValueChange}
            value={value ?? ""}
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
            autoComplete="off"
            id="TransactionValue"
            helperText={valueError ? "Value is required" : null}
          />
          <CustomTextField
            label="Label"
            InputLabelProps={{ shrink: true }}
            placeholder="e.g netflix"
            variant="standard"
            className="ml-4 transaction-label grow"
            value={label ?? ""}
            onChange={handleTransactionLabelChange}
            onBlur={handleTransactionLabelChange}
            autoComplete="off"
            id="TransactionLabel"
            helperText={labelError ? "Label is required" : null}
          />
        </div>
      </div>
      <div className="transaction-info">
        <FormControlLabel
          control={
            <Checkbox
              checked={confirmed}
              onChange={handleTransactionConfirmedChange}
            />
          }
          label="Confirmed"
          className="confirmed-label"
        />
        <Button
          onClick={handleSelectCategoryClicked}
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
              value={transactionDate}
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
                      className: "font-medium",
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
            value={repeatMenu ?? "none"}
            onChange={handleRepeatMenuChange}
            sx={{ border: 0 }}
          >
            <MenuItem value={"none"}>Does not repeat</MenuItem>
            <MenuItem value={"daily"}>Repeat every day</MenuItem>
            <MenuItem value={"weekly"}>Repeat every week</MenuItem>
            <MenuItem value={"monthly"}>Repeat every month</MenuItem>
            <MenuItem value={"yearly"}>Repeat every year</MenuItem>
            <MenuItem value={"custom"}>Custom</MenuItem>
          </Select>
        </div>
        <div className="repeat-options flex flex-col gap-2 mb-1">
          {repeatMenu === "custom" && (
            <div className="flex gap-3 items-center">
              <span className="uppercase text-xs w-11">Every</span>
              <TextField
                variant="standard"
                inputProps={{
                  style: { width: 20, textAlign: "center" },
                }}
                value={repeatEvery ?? 1}
                onChange={handleRepeatEveryChange}
                onBlur={handleRepeatEveryChange}
              />
              <HorizontalSelect
                defaultSelect={{ value: repeat }}
                className="horizontal-select"
                onSelect={handleRepeatChange}
                values={RepeatTypeSelectValues}
              />
            </div>
          )}
          {repeatMenu !== "none" && (
            <div className="repeat-end">
              <div className="flex items-center">
                <span className="uppercase text-xs w-14">Ends</span>
                <HorizontalSelect
                  className="horizontal-select capitalize"
                  onSelect={handleRepeatEndTypeChange}
                  values={RepeatEndTypeSelectValues}
                  defaultSelect={{ value: repeatEndType }}
                />
              </div>
              {repeatEndType === "on" && (
                <div>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <MobileDatePicker
                      className="border-none"
                      inputFormat="dd MMM yyyy"
                      value={repeatEndDate}
                      onChange={handleRepeatDateChange}
                      renderInput={(params) => (
                        <div className="date-picker-render flex items-center">
                          <TextField
                            {...params}
                            variant="standard"
                            size="small"
                            className="date-picker-input ml-11"
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
              )}
              {repeatEndType === "after" && (
                <div className="ml-14 mt-2 mb-4 flex items-center gap-2">
                  <TextField
                    variant="standard"
                    inputProps={{
                      style: { width: 20, textAlign: "center" },
                    }}
                    value={repeatEndOccurrences}
                    onChange={handleRepeatEndOccurrencesChange}
                    onBlur={handleRepeatEndOccurrencesChange}
                  />
                  <span className="xs">occurrences</span>
                </div>
              )}
            </div>
          )}
        </div>
        {repeatMenu === "custom" && <RepeatSummary />}
        {!openDescription && (
          <Button
            onClick={() => setOpenDescription(true)}
            size="large"
            className="label-button justify-start normal-case"
            startIcon={<DescriptionOutlined />}
          >
            <span className="description-btn-text">
              {(description ?? "").trim().length === 0
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
              onChange={handleEditableDescriptionChange}
              className="description-input p-2 outline-0 w-full border-2 grow"
            ></textarea>
            <Button
              className="mt-2"
              onClick={() => {
                dispatch(setTransactionDescription(editableDescription));
                setOpenDescription(false);
              }}
            >
              Done
            </Button>
          </div>
        )}
        {error && (
          <div className="text-red-500 font-medium p-4 text-center">
            {error}
          </div>
        )}
        <Dialog
          fullScreen
          open={selectCategoryDialogOpen}
          onClose={() => setSelectCategoryDialogOpen(false)}
          container={() => document.querySelector("#app > #wrapper")}
        >
          <PickCategoriesStyled>
            <AppBar className="dark:bg-[#7b1fa2]" sx={{ position: "relative" }}>
              <Toolbar sx={{ minHeight: "50px" }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={() => setSelectCategoryDialogOpen(false)}
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
                        dispatch(setTransactionCategory(cat));
                        setSelectCategoryDialogOpen(false);
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
          open={repeatTransactionDialogOpen}
          onClose={handleRepeatTransactionDialogClose}
        />
        <DeleteTransactionDialog
          type="transaction"
          open={deleteTransactionDialogOpen}
          onClose={handleDeleteTransactionDialogClose}
        />
        <WarningDialog
          open={warningDialogOpen}
          onClose={handleWarningDialogClose}
        />
      </div>
    </TransactionPageStyled>
  );
};

export default TransactionPage;
