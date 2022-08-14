import axios from "axios";
import { format, getTime } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../../infrastructure/CustomDateUtils";
import {
  getCategories,
  getTransactionsByMonth,
  Transaction,
} from "../../server-api";
import {
  setCategories,
  setNow,
  setSelected,
  setTransactions,
} from "../../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import CalendarNavigation from "../../components/CalendarNavigation";
import DesktopTransaction from "../../components/desktop/DesktopTransaction";
import DesktopCalendarPageStyled from "../styles/desktop/DesktopCalendarPage.styled";
import DesktopCalendarDay from "../../components/desktop/DesktopCalendarDay";
import DesktopDaysOfWeek from "../../components/desktop/DesktopDaysOfWeek";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const initialNow = new Date();

const DesktopCalendarPage = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction>(null);
  const dispatch = useAppDispatch();

  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const transactionCache = useAppSelector(
    (state) => state.calendarReducer.transactionCache
  );

  const [parsedNow, setParsedNow] = useState<Date>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>();

  const now = useAppSelector((state) => state.calendarReducer.now);
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const days: Date[] = useAppSelector(
    (state) => state.calendarReducer.days
  ).map(fromUnixTimeMs);

  useEffect(() => {
    if (!showSearchInput) {
      return;
    }

    searchInputRef.current.querySelector("input").focus();
  }, [showSearchInput, searchInputValue]);

  useEffect(() => {
    setParsedNow(fromUnixTimeMs(now));
  }, [now]);
  2;
  useEffect(() => {
    if (!selected) {
      dispatch(setSelected(getTime(initialNow)));
    }

    if (!now) {
      dispatch(setNow(getTime(initialNow)));
    }

    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setCategories(resp.data));
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (parsedNow === null) {
      return;
    }

    const key = format(parsedNow, "yyyy-MMMM");

    const cachedTransactions = transactionCache[key];

    if (Array.isArray(cachedTransactions)) {
      dispatch(setTransactions(cachedTransactions));
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getTransactionsByMonth(
          parsedNow.getMonth() + 1,
          parsedNow.getFullYear()
        );

        if (resp.status !== 200) {
          return;
        }

        dispatch(setTransactions(resp.data));
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [parsedNow, dispatch, transactionCache]);

  return (
    <DesktopCalendarPageStyled
      isDarkMode={isDarkMode}
      hasSixRows={days.length === 42}
    >
      <div className="shadow h-full flex flex-col">
        <div className="flex justify-end mt-1">
          {showSearchInput && (
            <TextField
              placeholder="e.g. car or 19.99"
              value={searchInputValue}
              ref={searchInputRef}
              variant="standard"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearchInputValue("")}
                      className={`${
                        searchInputValue.trim().length === 0 ? "invisible" : ""
                      }`}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              onChange={(e) => {
                setSearchInputValue(e.target.value);
              }}
              onBlur={(e) => {
                setSearchInputValue(e.target.value);

                if (e.target.value.trim().length > 0) {
                  return;
                }

                setShowSearchInput(false);
              }}
            />
          )}
          <IconButton onClick={() => setShowSearchInput(true)}>
            <SearchIcon />
          </IconButton>
          <CalendarNavigation />
        </div>
        <div className="calendar-wrapper">
          <DesktopDaysOfWeek />
          {parsedNow &&
            days.map((day, idx) => (
              <DesktopCalendarDay
                onTransactionClick={(transaction) => {
                  setCurrentTransaction(transaction);
                  setShowTransactionModal(true);
                }}
                onClick={(newSelected) => {
                  dispatch(setSelected(getTime(newSelected)));
                  setCurrentTransaction(null);
                  setShowTransactionModal(true);
                }}
                month={parsedNow.getMonth()}
                key={idx}
                date={day}
                isToday={DatesAreEqualWithoutTime(day, initialNow)}
                searchInputValue={searchInputValue}
              />
            ))}
        </div>
      </div>
      <DesktopTransaction
        open={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={currentTransaction}
      />
    </DesktopCalendarPageStyled>
  );
};

export default DesktopCalendarPage;
