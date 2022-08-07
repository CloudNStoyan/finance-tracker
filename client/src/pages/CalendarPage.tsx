import axios from "axios";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import CalendarDay from "../components/CalendarDay";
import { getTransactionsByMonth, Transaction } from "../server-api";
import CalendarPageStyled from "./styles/CalendarPage.styled";

const CalendarPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [days, setDays] = useState<Moment[]>([]);
  const [now, setNow] = useState(moment());
  const [selected, setSelected] = useState(moment());

  const findDays = (date: Moment) => {
    const day = date.day();

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
    const afterResult = findDays(moment(now).endOf("month"));

    const after: Moment[] = [];

    const afterLength = now.daysInMonth() - now.date() + afterResult.after;

    for (let i = 0; i < afterLength; i++) {
      after.push(moment(now).add(i + 1, "d"));
    }

    const before: Moment[] = [];

    const beforeResult = findDays(moment(now).startOf("month"));

    const beforeLength = now.date() - 1 + beforeResult.before;

    for (let i = 0; i < beforeLength; i++) {
      before.push(moment(now).subtract(i + 1, "d"));
    }

    before.reverse();

    const newDays = [...before, now, ...after];

    if (newDays.length === 35) {
      for (let i = 0; i < 7; i++) {
        newDays.push(moment(newDays[newDays.length - 1]).add(1, "d"));
      }
    }

    setDays(newDays);
  }, [now]);

  useEffect(() => {
    if (selected.month() > now.month() || selected.year() > now.year()) {
      setNow(moment(now.add(1, "M")));
    } else if (selected.month() < now.month() || selected.year() < now.year()) {
      setNow(moment(now.subtract(1, "M")));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getTransactionsByMonth(now.month() + 1);

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
          <button onClick={() => setNow(moment(now.subtract(1, "M")))}>
            &lt;-Left
          </button>
          <span className="mx-5">{now.format("MMMM YYYY")}</span>
          <button onClick={() => setNow(moment(now.add(1, "M")))}>
            Right-&gt;
          </button>
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
              month={now.month()}
              key={idx}
              transactions={transactions}
              date={day}
              isToday={
                moment().format("YYYY-MM-DD") === day.format("YYYY-MM-DD")
              }
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
