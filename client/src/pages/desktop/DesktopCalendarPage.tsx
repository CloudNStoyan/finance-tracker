import { format, getTime } from "date-fns";
import { useEffect, useState } from "react";
import {
  DatesAreEqualWithoutTime,
  fromUnixTimeMs,
} from "../../infrastructure/CustomDateUtils";
import {
  fetchStartBalance,
  setNow,
  setSelected,
  setStartBalance,
} from "../../state/calendarSlice";
import { useAppDispatch, useAppSelector } from "../../state/hooks";

import DesktopCalendarPageStyled from "./DesktopCalendarPage.styled";
import DesktopCalendarDay from "../../components/desktop/DesktopCalendarDay";
import DesktopDaysOfWeek from "../../components/desktop/DesktopDaysOfWeek";

import { fetchTransactionsByRange } from "../../state/transactionSlice";
import { fetchCategories } from "../../state/categorySlice";
import { clearTransactionState } from "../../state/addOrEditTransactionSlice";
import DesktopTransaction from "../../components/desktop/DesktopTransaction";

const initialNow = new Date();

const DesktopCalendarPage = () => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const dispatch = useAppDispatch();

  const selected = useAppSelector((state) => state.calendarReducer.selected);

  const [parsedNow, setParsedNow] = useState<Date>(null);

  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  const { now, startBalanceCache, searchValue } = useAppSelector(
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
    if (categoriesStatus === "idle" || categoriesStatus === "failed") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

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
    if (parsedNow === null || balanceStatus !== "idle" || days.length === 0) {
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
        <div className="calendar-wrapper">
          <DesktopDaysOfWeek />
          {parsedNow &&
            days.map((day) => (
              <DesktopCalendarDay
                onTransactionClick={() => {
                  setShowTransactionModal(true);
                }}
                onCreateTransaction={(date) => {
                  dispatch(setSelected(getTime(date)));
                  dispatch(clearTransactionState());
                  setShowTransactionModal(true);
                }}
                month={parsedNow.getMonth()}
                key={day.toDateString()}
                date={day}
                isToday={DatesAreEqualWithoutTime(day, initialNow)}
                searchInputValue={searchValue}
              />
            ))}
        </div>
      </div>
      <DesktopTransaction
        open={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          dispatch(setSelected(null));
          dispatch(clearTransactionState());
        }}
        key={selected}
      />
    </DesktopCalendarPageStyled>
  );
};

export default DesktopCalendarPage;
