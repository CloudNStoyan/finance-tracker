import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  styled,
  TextField,
} from "@mui/material";
import LoadingCircleAnimation from "../LoadingCircleAnimation";
import DesktopTransactionModalStyled from "./DesktopTransactionModal.styled";
import {
  Add,
  Delete,
  Remove,
  ScheduleOutlined,
  LoopOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Icons from "../../infrastructure/Icons";
import HorizontalSelect, { HorizontalSelectValue } from "../HorizontalSelect";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { FunctionComponent, useEffect, useState } from "react";
import { Transaction, TransactionRepeatType } from "../../server-api";
import DefaultCategory from "../../state/DefaultCategory";
import {
  setTransactionConfirmed,
  setTransactionDate,
  setTransactionLabel,
  setTransactionRepeat,
  setTransactionRepeatEndDate,
  setTransactionRepeatEndOccurrencess,
  setTransactionRepeatEndType,
  setTransactionRepeatEvery,
  setTransactionType,
  setTransactionValue,
} from "../../state/addOrEditTransactionSlice";
import RepeatTransactionDialog, {
  OptionType,
  RepeatModeOptionValue,
} from "../RepeatTransactionDialog";
import { setNotification } from "../../state/notificationSlice";
import {
  addNewOrEditTransaction,
  deleteTransaction,
  resetAddOrEditTransactionStatus,
  resetDeleteTransactionStatus,
} from "../../state/transactionSlice";
import { DateOnlyToString } from "../../infrastructure/CustomDateUtils";
import { TransactionDialogModalType } from "./DesktopTransaction";
import DeleteDialog from "../DeleteDialog";
import { CustomChangeEvent } from "../../infrastructure/Utils";
import RepeatSummary from "../RepeatSummary";

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
  "& .MuiInput-underline.Mui-disabled:after": {
    borderBottomStyle: "solid",
  },
  "& .MuiInput-underline.Mui-disabled:before": {
    borderBottomStyle: "solid",
  },
  "& label": {
    color: "white",
  },
  "& label.Mui-disabled": {
    color: "white",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "white",
  },
});

interface DesktopTransactionModalProps {
  setCurrentModal: (modal: TransactionDialogModalType) => void;
  onClose: () => void;
}

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

const DesktopTransactionModal: FunctionComponent<
  DesktopTransactionModalProps
> = ({ setCurrentModal, onClose }) => {
  const dispatch = useAppDispatch();
  const {
    category,
    description,
    value,
    label,
    confirmed,
    repeat,
    repeatEndDate,
    repeatEndOccurrences,
    repeatEndType,
    repeatEvery,
    transactionId,
  } = useAppSelector((state) => state.addOrEditTransactionReducer);
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);

  const [repeatMenu, setRepeatMenu] = useState(
    DefaultRepeatMenuState(repeat, repeatEvery)
  );

  const transactionType = useAppSelector(
    (state) => state.addOrEditTransactionReducer.type
  );

  const transactionDateInNumber = useAppSelector(
    (state) => state.addOrEditTransactionReducer.transactionDate
  );

  const transactionDate = transactionDateInNumber
    ? new Date(transactionDateInNumber)
    : new Date();

  const [dateInputOpen, setDateInputOpen] = useState(false);
  const [repeatDateInputOpen, setRepeatDateInputOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(null);
  const [valueError, setValueError] = useState(false);
  const [labelError, setLabelError] = useState(false);
  const [repeatTransactionDialogOpen, setRepeatTransactionDialogOpen] =
    useState(false);
  const [repeatTransactionDialogCallback, setRepeatTransactionDialogCallback] =
    useState<(option: OptionType) => void>();
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogCallback, setDeleteTransactionDialogCallback] =
    useState<(option: boolean) => void>();

  const { addOrEditTransactionStatus, deleteTransactionStatus } =
    useAppSelector((state) => state.transactionsReducer);

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
    console.log(repeatMenuOption);

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

  const handleDateInputClose = () => setDateInputOpen(false);

  const handleDateInputClick = () => setDateInputOpen(true);

  const handleRepeatDateInputClose = () => setRepeatDateInputOpen(false);

  const handleRepeatDateInputClick = () => setRepeatDateInputOpen(true);

  const navigateToDescriptionModal = () => setCurrentModal("description");

  const navigateToSelectCategoryModal = () =>
    setCurrentModal("select-category");

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

  useEffect(() => {
    switch (addOrEditTransactionStatus) {
      case "succeeded":
        dispatch(
          setNotification({
            message: "Transaction created.",
            color: "success",
          })
        );
        onClose();
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
  }, [addOrEditTransactionStatus, onClose, dispatch]);

  useEffect(() => {
    switch (deleteTransactionStatus) {
      case "succeeded":
        dispatch(
          setNotification({
            message: "Transaction deleted.",
            color: "success",
          })
        );
        onClose();
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
  }, [deleteTransactionStatus, onClose, dispatch]);

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

  const onSubmit = () => {
    const valueIsInvalid = value < 1;
    const labelIsInvalid = label.trim().length === 0;

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

    if (repeatMenu !== "none") {
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

    if (repeatMenu !== "none") {
      setRepeatTransactionDialogOpen(true);

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

  const deleteTransactionCallback = async (
    repeatMode?: RepeatModeOptionValue
  ) => {
    setLoading(true);
    setError(null);

    try {
      await dispatch(
        deleteTransaction({
          transactionId,
          repeatMode,
          date: transactionDate,
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DesktopTransactionModalStyled
        bgColor={
          category != undefined ? category.bgColor : DefaultCategory.bgColor
        }
        isDarkMode={isDarkMode}
        isLoading={loading}
      >
        {loading && <LoadingCircleAnimation className="loading-wrapper" />}
        <div className="relative fields">
          <div className="m-2 flex items-end">
            <IconButton
              className="text-white"
              onClick={handleTransactionTypeChange}
              disabled={loading}
            >
              {transactionType === "expense" ? <Remove /> : <Add />}
            </IconButton>
            <CustomTextField
              autoComplete="off"
              id="TransactionValue"
              onChange={handleTransactionValueChange}
              onBlur={handleTransactionValueChange}
              value={value ?? ""}
              variant="standard"
              className="transaction-value"
              InputLabelProps={{ shrink: true }}
              label="Value"
              placeholder="0.00"
              disabled={loading}
              helperText={valueError ? "Value is required" : null}
            />
            <CustomTextField
              InputLabelProps={{ shrink: true }}
              placeholder="e.g netflix"
              label="Label"
              variant="standard"
              className="ml-4 transaction-label"
              value={label ?? ""}
              onChange={handleTransactionLabelChange}
              onBlur={handleTransactionLabelChange}
              disabled={loading}
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
                className="checkbox-wrapper"
              />
            }
            className="select-none"
            label="Confirmed"
            disabled={loading}
          />
          <Button
            onClick={navigateToSelectCategoryModal}
            className="label-button justify-start normal-case"
            size="large"
            startIcon={
              category != undefined
                ? Icons[category.icon]
                : Icons[DefaultCategory.icon]
            }
            disabled={loading}
          >
            {category != undefined ? category.name : "Uncategorized"}
          </Button>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                inputFormat="dd MMM yyy"
                disableMaskedInput={true}
                value={transactionDate}
                onChange={handleDateChange}
                open={dateInputOpen}
                onClose={handleDateInputClose}
                renderInput={(params) => (
                  <div className="date-picker-render flex items-center">
                    <TextField
                      {...params}
                      variant="standard"
                      size="small"
                      className="date-picker-input"
                      autoComplete="off"
                      id="TransactionDate"
                      InputProps={{
                        startAdornment: (
                          <IconButton
                            className="p-0"
                            onClick={handleDateInputClick}
                          >
                            <ScheduleOutlined className="date-picker-icon" />
                          </IconButton>
                        ),
                        disableUnderline: true,
                      }}
                    />
                  </div>
                )}
                disabled={loading}
              />
            </LocalizationProvider>
          </div>

          <div className="repeat-selector-wrapper">
            <LoopOutlined className="icon" />
            <Select
              variant="standard"
              className="repeat-select"
              value={repeatMenu}
              onChange={handleRepeatMenuChange}
              onBlur={handleRepeatMenuChange}
              sx={{ border: 0 }}
              disabled={loading}
            >
              <MenuItem value={"none"}>Does not repeat</MenuItem>
              <MenuItem value={"daily"}>Repeat every day</MenuItem>
              <MenuItem value={"weekly"}>Repeat every week</MenuItem>
              <MenuItem value={"monthly"}>Repeat every month</MenuItem>
              <MenuItem value={"yearly"}>Repeat every year</MenuItem>
              <MenuItem value={"custom"}>Custom</MenuItem>
            </Select>
          </div>
          {repeatMenu !== "none" && (
            <div className="repeat-options flex flex-col gap-2 mb-1">
              {repeatMenu === "custom" && (
                <div className="flex gap-3 items-center">
                  <span className="uppercase text-xs w-11">Every</span>
                  <TextField
                    variant="standard"
                    inputProps={{
                      style: { width: 20, textAlign: "center" },
                    }}
                    value={repeatEvery ?? ""}
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
              <div className="repeat-end">
                <div className="flex items-center">
                  <span className="uppercase text-xs w-14">Ends</span>
                  <HorizontalSelect
                    className="horizontal-select capitalize"
                    onSelect={handleRepeatEndTypeChange}
                    values={RepeatEndTypeSelectValues}
                    defaultSelect={repeatEndType}
                  />
                </div>
                {repeatEndType === "on" && (
                  <div>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DesktopDatePicker
                        inputFormat="dd MMM yyy"
                        disableMaskedInput={true}
                        value={repeatEndDate}
                        onChange={handleRepeatDateChange}
                        open={repeatDateInputOpen}
                        onClose={handleRepeatDateInputClose}
                        renderInput={(params) => (
                          <div className="date-picker-render ml-14 flex items-center mt-2 mb-4">
                            <TextField
                              {...params}
                              variant="standard"
                              size="small"
                              className="date-picker-input"
                              autoComplete="off"
                              id="TransactionRepeatEnd"
                              InputProps={{
                                startAdornment: (
                                  <IconButton
                                    className="p-0"
                                    onClick={handleRepeatDateInputClick}
                                  >
                                    <ScheduleOutlined className="date-picker-icon" />
                                  </IconButton>
                                ),
                                disableUnderline: true,
                              }}
                            />
                          </div>
                        )}
                        disabled={loading}
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
            </div>
          )}
          {repeatMenu === "custom" && <RepeatSummary />}
          <Button
            onClick={navigateToDescriptionModal}
            size="large"
            className="label-button justify-start normal-case"
            startIcon={<DescriptionOutlined />}
            disabled={loading}
          >
            <span className="description-btn-text">
              {!description ? "Add description" : description}
            </span>
          </Button>
        </div>
        <div className="p-4 w-full flex">
          {transactionId && (
            <IconButton
              onClick={onDelete}
              className="text-red-500"
              disabled={loading}
            >
              <Delete />
            </IconButton>
          )}

          <Button
            onClick={onSubmit}
            className="block ml-auto"
            variant="contained"
            disabled={loading}
          >
            {transactionId ? "Save" : "Create"}
          </Button>
        </div>
        {error && (
          <div className="text-red-500 font-medium p-4 text-center">
            {error}
          </div>
        )}
        <RepeatTransactionDialog
          open={repeatTransactionDialogOpen}
          onClose={handleRepeatTransactionDialogClose}
        />
        <DeleteDialog
          type="transaction"
          open={deleteTransactionDialogOpen}
          onClose={handleDeleteTransactionDialogClose}
        />
      </DesktopTransactionModalStyled>
    </>
  );
};

export default DesktopTransactionModal;
