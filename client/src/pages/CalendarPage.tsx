import axios from "axios";
import {
  getDaysInMonth,
  endOfMonth,
  addDays,
  startOfMonth,
  addMonths,
  subMonths,
  format,
  isBefore,
} from "date-fns";
import { isAfter, subDays } from "date-fns/esm";
import React, { useEffect, useState } from "react";
import CalendarDay from "../components/CalendarDay";
import { DatesAreEqualWithoutTime } from "../infrastructure/CustomDateUtils";
import { getTransactionsByMonth, Transaction } from "../server-api";
import CalendarPageStyled from "./styles/CalendarPage.styled";

const initialNow = new Date();

const CalendarPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [days, setDays] = useState<Date[]>([]);
  const [now, setNow] = useState(initialNow);
  const [selected, setSelected] = useState(initialNow);

  const findDays = (date: Date) => {
    const day = date.getDay();

    if (day === 0) {
      return {
        before: 6,
        after: 0,
      };
    }

    return {
      before: day - 1,
      after: 7 - day,
    };
  };

  useEffect(() => {
    const afterResult = findDays(endOfMonth(now));

    const after: Date[] = [];

    const afterLength = getDaysInMonth(now) - now.getDate() + afterResult.after;
    4;
    for (let i = 0; i < afterLength; i++) {
      after.push(addDays(now, i + 1));
    }

    const before: Date[] = [];

    const beforeResult = findDays(startOfMonth(now));

    const beforeLength = now.getDate() - 1 + beforeResult.before;

    for (let i = 0; i < beforeLength; i++) {
      before.push(subDays(now, i + 1));
    }

    before.reverse();

    const newDays = [...before, now, ...after];

    setDays(newDays);
  }, [now]);

  useEffect(() => {
    if (selected.getMonth() === now.getMonth()) {
      return;
    }

    if (isAfter(selected, now)) {
      setNow(addMonths(now, 1));
    } else if (isBefore(selected, now)) {
      setNow(subMonths(now, 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getTransactionsByMonth(now.getMonth() + 1);

        if (resp.status !== 200) {
          return;
        }

        setTransactions(resp.data);
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [now]);

  return (
    <>
      <div>
        <div>
          <button onClick={() => setNow(subMonths(now, 1))}>&lt;-Left</button>
          <span className="mx-5">{format(now, "MMMM yyyy")}</span>
          <button onClick={() => setNow(addMonths(now, 1))}>Right-&gt;</button>
        </div>
        <CalendarPageStyled>
          {["MON", "TUE", "WED", "THU", "FRI"].map((day, idx) => (
            <div
              className="text-center text-gray-800 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
          {["SAT", "SUN"].map((day, idx) => (
            <div
              className="text-center text-gray-500 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <CalendarDay
              onClick={setSelected}
              month={now.getMonth()}
              key={idx}
              transactions={transactions}
              date={day}
              isToday={DatesAreEqualWithoutTime(day, initialNow)}
              selected={selected}
            />
          ))}
        </CalendarPageStyled>
      </div>
      <div></div>
    </>
  );
};

export default CalendarPage;
