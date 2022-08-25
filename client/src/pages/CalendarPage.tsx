import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { format, getTime } from "date-fns";
import React, { useEffect, useState } from "react";
import CalendarDay from "../components/CalendarDay";
import CalendarTransactionList from "../components/CalendarTransactionList";
import DaysOfWeek from "../components/DaysOfWeek";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { getTransactionsBeforeAndAfterDate } from "../server-api";
import {
  fetchStartBalance,
  setNow,
  setSelected,
  setStartBalance,
} from "../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import CalendarPageStyled from "./styles/CalendarPage.styled";
import { useNavigate } from "react-router-dom";
import CalendarNavigation from "../components/CalendarNavigation";
import { addQuery, addTransactions } from "../state/transactionSlice";
import { fetchCategories } from "../state/categorySlice";

const initialNow = new Date();

const CalendarPage = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const selected = useAppSelector((state) => state.calendarReducer.selected);
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const { completedTansactionQueries } = useAppSelector(
    (state) => state.transactionsReducer
  );

  const [parsedNow, setParsedNow] = useState<Date>(null);

  const { now, startBalanceCache } = useAppSelector(
    (state) => state.calendarReducer
  );

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  const balanceFetchingStatus = useAppSelector(
    (state) => state.calendarReducer.fetchingStatus
  );

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  const days: Date[] = useAppSelector(
    (state) => state.calendarReducer.days
  ).map(fromUnixTimeMs);

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
  }, [selected, now, dispatch]);

  useEffect(() => {
    if (parsedNow === null || balanceFetchingStatus !== "idle") {
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
  }, [parsedNow, dispatch, startBalanceCache, days, balanceFetchingStatus]);

  useEffect(() => {
    if (parsedNow === null) {
      return;
    }

    const query = format(parsedNow, "yyyy-MMMM");

    if (completedTansactionQueries.includes(query)) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getTransactionsBeforeAndAfterDate(
          days[0],
          days[days.length - 1]
        );

        if (resp.status !== 200) {
          return;
        }

        dispatch(addTransactions(resp.data));
        dispatch(addQuery(query));
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [parsedNow, dispatch, completedTansactionQueries, days]);

  return (
    categoriesStatus === "succeeded" && (
      <CalendarPageStyled
        isDarkMode={isDarkMode}
        className="h-full flex flex-col"
      >
        <div className="shadow calendar-container pt-1">
          <CalendarNavigation />
          <div className="calendar-wrapper">
            <DaysOfWeek />
            {parsedNow &&
              days.map((day, idx) => (
                <CalendarDay
                  onClick={(newSelected) => {
                    dispatch(setSelected(getTime(newSelected)));

                    if (parsedNow.getMonth() != newSelected.getMonth()) {
                      dispatch(setNow(getTime(newSelected)));
                    }
                  }}
                  month={parsedNow.getMonth()}
                  key={idx}
                  date={day}
                  isToday={DatesAreEqualWithoutTime(day, initialNow)}
                />
              ))}
          </div>
        </div>

        <Fab
          onClick={() => navigate("/transaction")}
          color="primary"
          aria-label="Add Transaction"
          className="absolute bottom-4 right-4"
        >
          <AddIcon />
        </Fab>
        <CalendarTransactionList />
      </CalendarPageStyled>
    )
  );
};

export default CalendarPage;
