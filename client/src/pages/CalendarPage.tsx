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
import { getCategories, getTransactionsByMonth } from "../server-api";
import {
  setCategories,
  setNow,
  setSelected,
  setTransactions,
} from "../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import CalendarPageStyled from "./styles/CalendarPage.styled";
import { useNavigate } from "react-router-dom";
import CalendarNavigation from "../components/CalendarNavigation";

const initialNow = new Date();

const CalendarPage = () => {
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  const selected = useAppSelector((state) => state.calendarReducer.selected);
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const transactionCache = useAppSelector(
    (state) => state.calendarReducer.transactionCache
  );

  const [parsedNow, setParsedNow] = useState<Date>(null);

  const now = useAppSelector((state) => state.calendarReducer.now);

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
  );
};

export default CalendarPage;
