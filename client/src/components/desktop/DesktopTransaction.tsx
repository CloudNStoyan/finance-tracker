import {
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  styled,
  Switch,
  TextField,
} from "@mui/material";
import {
  Add,
  Delete,
  Remove,
  ScheduleOutlined,
  LoopOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import { FunctionComponent, useEffect, useState } from "react";
import DesktopTransactionStyled from "../styles/desktop/DesktopTransaction.styled";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import DefaultCategory from "../../state/DefaultCategory";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  DateOnlyToString,
  fromUnixTimeMs,
} from "../../infrastructure/CustomDateUtils";
import { Category, Transaction } from "../../server-api";
import { parseJSON } from "date-fns";
import { setNotification } from "../../state/notificationSlice";
import {
  addNewOrEditTransaction,
  deleteTransaction,
  resetAddOrEditTransactionStatus,
  resetDeleteTransactionStatus,
} from "../../state/transactionSlice";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Icons from "../../infrastructure/Icons";
import DesktopModalContainerStyled from "../styles/desktop/DesktopModalContainer.styled";
import DesktopPickCategoriesModal from "./DesktopPickCategoriesModal";
import DesktopManageCategoriesModal from "./DesktopManageCategoriesModal";
import DesktopCategoryModal from "./DesktopCategoryModal";
import DesktopDescriptionModal from "./DesktopDescriptionModal";
import RepeatTransactionDialog, {
  OptionType,
  OptionValue,
} from "../RepeatTransactionDialog";
import DeleteTransactionDialog from "../DeleteDialog";
import LoadingCircleAnimation from "../LoadingCircleAnimation";

export type DesktopTransactionProps = {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
};

export type ModalType =
  | "transaction"
  | "select-category"
  | "manage-categories"
  | "category"
  | "description";

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

const DesktopTransaction: FunctionComponent<DesktopTransactionProps> = ({
  open,
  onClose,
  transaction,
}) => {
  const calendarSelected = useAppSelector(
    (state) => state.calendarReducer.selected
  );

  const [transactionType, setTransactionType] = useState("expense");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const [currentModal, setCurrentModal] = useState<ModalType>("transaction");
  const [modalHistory, setModalHistory] = useState<ModalType[]>([]);
  const [date, setDate] = useState<Date | null>(
    fromUnixTimeMs(calendarSelected) ?? new Date()
  );
  const [dateInputOpen, setDateInputOpen] = useState(false);
  const [repeat, setRepeat] = useState("none");
  const [category, setCategory] = useState<Category | undefined>();
  const [editCategory, setEditCategory] = useState<Category>(null);
  const [description, setDescription] = useState("");
  const [repeatEnd, setRepeatEnd] = useState(new Date());
  const [showRepeatEnd, setShowRepeatEnd] = useState(false);
  const [repeatDateInputOpen, setRepeatDateInputOpen] = useState(false);
  const [repeatTransactionDialogOpen, setRepeatTransactionDialogOpen] =
    useState(false);
  const [repeatTransactionDialogCallback, setRepeatTransactionDialogCallback] =
    useState<(option: OptionType) => void>();
  const [deleteTransactionDialogOpen, setDeleteTransactionDialogOpen] =
    useState(false);
  const [deleteTransactionDialogCallback, setDeleteTransactionDialogCallback] =
    useState<(option: boolean) => void>();
  const [itHasRepeat, setItHasRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addOrEditTransactionStatus, deleteTransactionStatus } =
    useAppSelector((state) => state.transactionsReducer);
  const [error, setError] = useState<string>(null);

  const dispatch = useAppDispatch();

  const { isDarkMode } = useAppSelector((state) => state.themeReducer);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  useEffect(() => {
    setModalHistory([currentModal, ...modalHistory.slice(0, 4)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModal]);

  useEffect(() => {
    if (!category?.categoryId) {
      return;
    }

    const selectedCat =
      categories.find((cat) => cat.categoryId === category.categoryId) ??
      DefaultCategory;

    setCategory(selectedCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    if (!transaction || !open) {
      return;
    }

    setValue(transaction.value.toString());
    setLabel(transaction.label);
    setConfirmed(transaction.confirmed);
    setTransactionType(transaction.type);
    setDate(
      transaction.repeat === null
        ? parseJSON(transaction.transactionDate)
        : fromUnixTimeMs(calendarSelected)
    );
    setCategory(
      categories.find((cat) => cat.categoryId === transaction.categoryId)
    );
    setDescription(transaction.details ?? "");
    setRepeat(transaction.repeat ?? "none");
    setRepeatEnd(
      transaction.repeatEnd === null
        ? new Date()
        : parseJSON(transaction.repeatEnd)
    );
    setShowRepeatEnd(transaction.repeatEnd !== null);
    setItHasRepeat(transaction.repeat !== null);
  }, [transaction, categories, open, calendarSelected]);

  useEffect(
    () => setDate(fromUnixTimeMs(calendarSelected)),
    [calendarSelected]
  );

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
    switch (addOrEditTransactionStatus) {
      case "success":
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
      case "success":
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

  const onSubmit = () => {
    if (Number(value) === 0 || label.trim().length === 0) {
      dispatch(
        setNotification({
          message: "Value and Label must not be empty!",
          color: "error",
        })
      );
      return;
    }

    if (addOrEditTransactionStatus === "loading") {
      return;
    }

    setError(null);

    setLoading(true);

    if (itHasRepeat) {
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

  const createOrEdit = async (repeatMode?: OptionValue) => {
    const newTransaction: Transaction = {
      label: label.trim(),
      value: Number(value),
      transactionDate: DateOnlyToString(date),
      type: transactionType === "income" ? "income" : "expense",
      confirmed,
      repeat:
        repeat === "weekly" || repeat === "monthly" || repeat === "yearly"
          ? repeat
          : null,
    };

    if (description.trim().length > 0) {
      newTransaction.details = description.trim();
    }

    if (transaction) {
      newTransaction.transactionId = Number(transaction.transactionId);
    }

    if (category !== undefined) {
      newTransaction.categoryId = category.categoryId;
    }

    if (showRepeatEnd && repeat !== "none") {
      newTransaction.repeatEnd = DateOnlyToString(repeatEnd);
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
    if (!transaction || deleteTransactionStatus !== "idle") {
      return;
    }

    if (itHasRepeat) {
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

  const deleteTransactionCallback = async (repeatMode?: OptionValue) => {
    setLoading(true);
    setError(null);

    try {
      await dispatch(
        deleteTransaction({
          transactionId: transaction.transactionId,
          repeatMode,
          date,
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repeat !== "none") {
      return;
    }

    setShowRepeatEnd(false);
  }, [repeat]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      container={() => document.getElementById("app")}
      PaperProps={{
        style: {
          borderRadius: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <DesktopModalContainerStyled>
        {currentModal === "select-category" && (
          <DesktopPickCategoriesModal
            onClose={() => setCurrentModal("transaction")}
            setCategory={setCategory}
            onSettings={() => setCurrentModal("manage-categories")}
            onAddCategory={() => {
              setEditCategory(null);
              setCurrentModal("category");
            }}
          />
        )}
        {currentModal === "manage-categories" && (
          <DesktopManageCategoriesModal
            onClose={() => setCurrentModal("select-category")}
            selectedCat={(cat) => {
              setEditCategory(cat);
              setCurrentModal("category");
            }}
            onAddCategory={() => {
              setEditCategory(null);
              setCurrentModal("category");
            }}
          />
        )}
        {currentModal === "category" && (
          <DesktopCategoryModal
            onClose={() => {
              setCurrentModal(modalHistory[1]);
            }}
            category={editCategory}
          />
        )}
        {currentModal === "description" && (
          <DesktopDescriptionModal
            description={description}
            onClose={() => setCurrentModal("transaction")}
            onDone={(descrp) => {
              setDescription(descrp);
              setCurrentModal("transaction");
            }}
          />
        )}
        {currentModal === "transaction" && (
          <DesktopTransactionStyled
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
                  onClick={() => {
                    setTransactionType(
                      transactionType === "expense" ? "income" : "expense"
                    );
                  }}
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
            <div className="transaction-info">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="checkbox-wrapper"
                  />
                }
                className="select-none"
                label="Confirmed"
                disabled={loading}
              />
              <Button
                onClick={() => setCurrentModal("select-category")}
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
                    disabled={loading}
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
                  disabled={loading}
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
                    disabled={loading}
                  />
                  {showRepeatEnd && (
                    <div>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DesktopDatePicker
                          inputFormat="dd MMM yyy"
                          disableMaskedInput={true}
                          value={repeatEnd}
                          onChange={handleRepeatDateChange}
                          open={repeatDateInputOpen}
                          onClose={() => setRepeatDateInputOpen(false)}
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
                                      <IconButton
                                        className="p-0"
                                        onClick={() =>
                                          setRepeatDateInputOpen(true)
                                        }
                                      >
                                        <ScheduleOutlined className="date-picker-icon" />
                                      </IconButton>
                                    ),
                                    disableUnderline: true,
                                  }}
                                />
                              )}
                            </div>
                          )}
                          disabled={loading}
                        />
                      </LocalizationProvider>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => setCurrentModal("description")}
                size="large"
                className="label-button justify-start normal-case"
                startIcon={<DescriptionOutlined />}
                disabled={loading}
              >
                <span className="description-btn-text">
                  {description.trim().length === 0
                    ? "Add description"
                    : description}
                </span>
              </Button>
            </div>
            <div className="p-4 w-full flex">
              {transaction && (
                <IconButton
                  onClick={() => void onDelete()}
                  className="text-red-500"
                  disabled={loading}
                >
                  <Delete />
                </IconButton>
              )}

              <Button
                onClick={() => void onSubmit()}
                className="block ml-auto"
                variant="contained"
                disabled={loading}
              >
                {transaction ? "Save" : "Create"}
              </Button>
            </div>
            {error && (
              <div className="text-red-500 font-medium p-4 text-center">
                {error}
              </div>
            )}
          </DesktopTransactionStyled>
        )}
        <RepeatTransactionDialog
          open={repeatTransactionDialogOpen}
          onClose={(option) => {
            setRepeatTransactionDialogOpen(false);

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
      </DesktopModalContainerStyled>
    </Dialog>
  );
};

export default DesktopTransaction;
