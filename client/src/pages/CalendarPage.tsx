import axios from "axios";
import { addMonths, subMonths, format, getTime } from "date-fns";
import React, { useEffect, useState } from "react";
import CalendarDay from "../components/CalendarDay";
import DaysOfWeek from "../components/DaysOfWeek";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import { getTransactionsByMonth } from "../server-api";
import { setNow, setSelected, setTransactions } from "../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import CalendarPageStyled from "./styles/CalendarPage.styled";

const initialNow = new Date();

const CalendarPage = () => {
  const dispatch = useAppDispatch();

  const transactions = useAppSelector(
    (state) => state.calendarReducer.transactions
  );

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
    dispatch(setNow(getTime(initialNow)));
    dispatch(setSelected(getTime(initialNow)));
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
        const resp = await getTransactionsByMonth(parsedNow.getMonth() + 1);

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
    <>
      <div>
        <div>
          <button
            onClick={() => dispatch(setNow(getTime(subMonths(parsedNow, 1))))}
          >
            &lt;-Left
          </button>
          <span className="mx-5">{now && format(now, "MMMM yyyy")}</span>
          <button
            onClick={() => dispatch(setNow(getTime(addMonths(parsedNow, 1))))}
          >
            Right-&gt;
          </button>
        </div>
        <CalendarPageStyled>
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
                transactions={transactions}
                date={day}
                isToday={DatesAreEqualWithoutTime(day, initialNow)}
              />
            ))}
        </CalendarPageStyled>
      </div>
      <div></div>
    </>
  );
};

export default CalendarPage;
