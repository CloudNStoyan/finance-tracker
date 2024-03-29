import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { format, getTime } from "date-fns";
import { useEffect, useState } from "react";
import CalendarDay from "../components/CalendarDay";
import CalendarTransactionList from "../components/CalendarTransactionList";
import DaysOfWeek from "../components/DaysOfWeek";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../infrastructure/CustomDateUtils";
import {
  fetchStartBalance,
  setNow,
  setSelected,
  setStartBalance,
} from "../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { useNavigate } from "react-router-dom";
import CalendarNavigation from "../components/CalendarNavigation";
import { fetchTransactionsByRange } from "../state/transactionSlice";
import { fetchCategories } from "../state/categorySlice";
import { styled } from "../infrastructure/ThemeManager";

const initialNow = new Date();

const CalendarPageStyled = styled.div<{ isDarkMode: boolean }>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f3f4f6")};
  max-height: calc(100vh - 50px);

  .calendar-nav {
    .today-btn {
      position: absolute;
      right: 0;
    }
  }

  .calendar-container {
    background-color: ${({ theme }) => theme.colors.background};
  }

  .calendar-wrapper {
    display: flex;
    flex-flow: row wrap;
    padding: 10px;

    > * {
      flex: 14%;
    }
  }
`;

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

  const transactionsStatus = useAppSelector(
    (state) => state.transactionsReducer.fetchingStatus
  );

  useEffect(() => {
    if (categoriesStatus === "idle" || categoriesStatus === "failed") {
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
    if (
      parsedNow === null ||
      balanceFetchingStatus !== "idle" ||
      days.length === 0
    ) {
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
    now,
    transactionsStatus,
  ]);

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
              days.map((day) => (
                <CalendarDay
                  onClick={(newSelected) => {
                    dispatch(setSelected(getTime(newSelected)));

                    if (parsedNow.getMonth() != newSelected.getMonth()) {
                      dispatch(setNow(getTime(newSelected)));
                    }
                  }}
                  month={parsedNow.getMonth()}
                  key={day.toDateString()}
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
