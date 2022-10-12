import { format, getTime } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../../infrastructure/CustomDateUtils";
import { Transaction } from "../../server-api";
import {
  fetchStartBalance,
  setNow,
  setSelected,
  setStartBalance,
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
import { fetchTransactionsByRange } from "../../state/transactionSlice";
import { fetchCategories } from "../../state/categorySlice";

const initialNow = new Date();

const DesktopCalendarPage = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction>(null);
  const dispatch = useAppDispatch();

  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const [parsedNow, setParsedNow] = useState<Date>(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>();

  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  const { now, startBalanceCache } = useAppSelector(
    (state) => state.calendarReducer
  );

  const balanceStatus = useAppSelector(
    (state) => state.calendarReducer.fetchingStatus
  );

  const transactionsStatus = useAppSelector(
    (state) => state.transactionsReducer.fetchingStatus
  );

  const { completedTansactionQueries } = useAppSelector(
    (state) => state.transactionsReducer
  );

  const days: Date[] = useAppSelector(
    (state) => state.calendarReducer.days
  ).map(fromUnixTimeMs);

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (!showSearchInput) {
      return;
    }

    searchInputRef.current.querySelector("input").focus();
  }, [showSearchInput, searchInputValue]);

  useEffect(() => {
    setParsedNow(fromUnixTimeMs(now));
  }, [now]);

  useEffect(() => {
    if (!selected) {
      dispatch(setSelected(getTime(initialNow)));
    }

    if (!now) {
      dispatch(setNow(getTime(initialNow)));
    }
  }, [dispatch, now, selected]);

  useEffect(() => {
    if (parsedNow === null || balanceStatus !== "idle") {
      return;
    }

    const key = `${format(days[0], "dd/MM/yy")}-${format(
      days[days.length - 1],
      "dd/MM/yy"
    )}`;

    const cachedBalance = startBalanceCache[key];

    if (cachedBalance) {
      dispatch(setStartBalance(cachedBalance));
      return;
    }

    void dispatch(fetchStartBalance(days[0]));
  }, [parsedNow, dispatch, startBalanceCache, days, balanceStatus]);

  useEffect(() => {
    if (parsedNow === null || transactionsStatus !== "idle") {
      return;
    }

    const query = format(parsedNow, "yyyy-MMMM");

    if (completedTansactionQueries.includes(query)) {
      return;
    }

    void dispatch(
      fetchTransactionsByRange({
        after: days[0],
        before: days[days.length - 1],
        now,
      })
    );
  }, [
    parsedNow,
    dispatch,
    completedTansactionQueries,
    days,
    transactionsStatus,
    now,
  ]);

  return (
    <DesktopCalendarPageStyled
      isDarkMode={isDarkMode}
      hasSixRows={days.length === 42}
    >
      <div className="shadow h-full flex flex-col">
        <div className="flex justify-end mt-2 mr-1">
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
                  dispatch(setSelected(getTime(day)));
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
