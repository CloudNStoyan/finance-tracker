import React, { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import { Category, Transaction } from "../../server-api";
import DefaultCategory from "../../state/DefaultCategory";
import { IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  addMonths,
  addWeeks,
  differenceInWeeks,
  format,
  getTime,
  lastDayOfMonth,
  parseJSON,
  setDate,
  subMonths,
} from "date-fns";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  fetchStartBalance,
  setNow as setNowCalendar,
  setStartBalance,
} from "../../state/calendarSlice";
import DesktopStatisticsPageStyled from "../styles/desktop/DesktopStatisticsPage.styled";
import DesktopStatsPanel from "../../components/desktop/DesktopStatsPanel";
import { fetchTransactionsByRange } from "../../state/transactionSlice";
import { fromUnixTimeMs } from "../../infrastructure/CustomDateUtils";
import { fetchCategories } from "../../state/categorySlice";

export type CategoryData = { [name: string]: number };

const GenerateChartDataset = (data: CategoryData, categories: Category[]) => {
  if (!data) {
    return null;
  }

  return {
    labels: Object.keys(data).map((catId) =>
      catId !== "default"
        ? categories.find((c) => c.categoryId === Number(catId)).name
        : DefaultCategory.name
    ),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: Object.keys(data).map((catId) =>
          catId !== "default"
            ? categories.find((c) => c.categoryId === Number(catId)).bgColor
            : DefaultCategory.bgColor
        ),
        hoverOffset: 4,
      },
    ],
  };
};

const GenerateData = (
  transactions: Transaction[],
  type: "income" | "expense"
) => {
  if (transactions === null) {
    return null;
  }

  const catTotals: CategoryData = {};

  transactions.forEach((transaction) => {
    if (transaction.type !== type) {
      return;
    }

    const catTotalKey = transaction.categoryId?.toString() ?? "default";
    if (catTotals[catTotalKey]) {
      catTotals[catTotalKey] += transaction.value;
    } else {
      catTotals[catTotalKey] = transaction.value;
    }
  });

  return Object.keys(catTotals).length === 0 ? null : catTotals;
};

const DesktopStatisticsPage = () => {
  const [now, setNow] = useState(new Date());
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>(
    []
  );
  const [expenses, setExpenses] = useState<CategoryData>();
  const [incomes, setIncomes] = useState<CategoryData>();
  const [expensesChartData, setExpensesChartData] =
    useState<ChartData<"doughnut">>();
  const [incomesChartData, setIncomesChartData] =
    useState<ChartData<"doughnut">>();

  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);
  const completedTansactionQueries = useAppSelector(
    (state) => state.transactionsReducer.completedTansactionQueries
  );

  const allTransactions = useAppSelector(
    (state) => state.transactionsReducer.transactions
  );

  const transactionsStatus = useAppSelector(
    (state) => state.transactionsReducer.fetchingStatus
  );
  const balanceFetchingStatus = useAppSelector(
    (state) => state.calendarReducer.fetchingStatus
  );

  const { days, startBalanceCache } = useAppSelector(
    (state) => state.calendarReducer
  );

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (categoriesStatus !== "succeeded") {
      return;
    }

    const dataset = GenerateChartDataset(expenses, categories);
    setExpensesChartData(dataset);
  }, [expenses, categories, categoriesStatus]);

  useEffect(() => {
    if (categoriesStatus !== "succeeded") {
      return;
    }

    const dataset = GenerateChartDataset(incomes, categories);
    setIncomesChartData(dataset);
  }, [incomes, categories, categoriesStatus]);

  useEffect(() => {
    setIncomes(GenerateData(currentTransactions, "income"));
    setExpenses(GenerateData(currentTransactions, "expense"));
  }, [currentTransactions]);

  useEffect(() => {
    dispatch(setNowCalendar(getTime(now)));
  }, [now, dispatch]);

  useEffect(() => {
    const transactionRepeats: Transaction[][] = [];
    allTransactions.forEach((t) => {
      if (t.repeat === null) {
        return;
      }

      const transactionDate = parseJSON(t.transactionDate);

      const lastDay = lastDayOfMonth(now);
      const firstDay = setDate(new Date(now).setHours(0, 0, 0, 0), 1);

      if (t.repeat === "weekly") {
        const transactions: Transaction[] = [];

        const tillDate =
          t.repeatEnd !== null ? parseJSON(t.repeatEnd) : lastDay;

        const occurences = differenceInWeeks(tillDate, transactionDate);

        for (let i = 0; i < occurences; i++) {
          const newDate = addWeeks(transactionDate, i + 1);

          if (newDate.getMonth() === firstDay.getMonth()) {
            const newTransaction = Object.assign({}, t);
            newTransaction.transactionDate = newDate.toJSON();
            transactions.push(newTransaction);
          }
        }

        transactionRepeats.push(transactions);
      }
    });

    const repeatedTransactions = transactionRepeats.reduce(
      (prev, curr) => [...prev, ...curr],
      []
    );

    setCurrentTransactions(
      [...allTransactions, ...repeatedTransactions]
        .filter((transaction) => {
          const transactionDate = new Date(transaction.transactionDate);

          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          );
        })
        .sort((a, b) =>
          new Date(a.transactionDate) > new Date(b.transactionDate) ? 1 : -1
        )
    );
  }, [allTransactions, now]);

  useEffect(() => {
    if (now === null || balanceFetchingStatus !== "idle" || days.length === 0) {
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

    void dispatch(fetchStartBalance(fromUnixTimeMs(days[0])));
  }, [now, dispatch, startBalanceCache, days, balanceFetchingStatus]);

  useEffect(() => {
    if (now === null || transactionsStatus !== "idle" || days.length === 0) {
      return;
    }

    const query = format(now, "yyyy-MMMM");

    if (completedTansactionQueries.includes(query)) {
      return;
    }

    void dispatch(
      fetchTransactionsByRange({
        after: fromUnixTimeMs(days[0]),
        before: fromUnixTimeMs(days[days.length - 1]),
        now: now.getTime(),
      })
    );
  }, [dispatch, completedTansactionQueries, days, now, transactionsStatus]);

  return (
    <DesktopStatisticsPageStyled isDarkMode={isDarkMode}>
      <div className="nav-wrapper flex flex-wrap flex-col items-center m-2 mb-0">
        <div className="nav flex justify-center items-center">
          <IconButton onClick={() => setNow(subMonths(now, 1))}>
            <ChevronLeft />
          </IconButton>
          {now && <span>{format(now, "MMMM yyyy")}</span>}
          <IconButton onClick={() => setNow(addMonths(now, 1))}>
            <ChevronRight />
          </IconButton>
        </div>
      </div>
      <div className="charts-container">
        <DesktopStatsPanel
          chartData={expensesChartData}
          categoryData={expenses}
          allTransactions={currentTransactions}
          chartType="expense"
        />
        <div className="splitter"></div>
        <DesktopStatsPanel
          chartData={incomesChartData}
          categoryData={incomes}
          chartType="income"
          allTransactions={currentTransactions}
        />
      </div>
    </DesktopStatisticsPageStyled>
  );
};

export default DesktopStatisticsPage;
