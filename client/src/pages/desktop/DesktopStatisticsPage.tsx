import React, { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import {
  Category,
  getTransactionsByMonth,
  Transaction,
} from "../../server-api";
import axios from "axios";
import DefaultCategory from "../../state/DefaultCategory";
import { IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { addMonths, format, getTime, subMonths } from "date-fns";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setNow as setNowCalendar } from "../../state/calendarSlice";
import DesktopStatisticsPageStyled from "../styles/desktop/DesktopStatisticsPage.styled";
import DesktopStatsPanel from "../../components/desktop/DesktopStatsPanel";
import { addQuery, addTransactions } from "../../state/transactionSlice";
import useCategories from "../../state/useCategories";

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

  const categories = useCategories();

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const dataset = GenerateChartDataset(expenses, categories);
    setExpensesChartData(dataset);
  }, [expenses, categories]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const dataset = GenerateChartDataset(incomes, categories);
    setIncomesChartData(dataset);
  }, [incomes, categories]);

  useEffect(() => {
    setIncomes(GenerateData(currentTransactions, "income"));
    setExpenses(GenerateData(currentTransactions, "expense"));
  }, [currentTransactions]);

  useEffect(() => {
    dispatch(setNowCalendar(getTime(now)));
  }, [now, dispatch]);

  useEffect(() => {
    setCurrentTransactions(
      allTransactions.filter(
        (transaction) =>
          new Date(transaction.transactionDate).getMonth() === now.getMonth()
      )
    );
  }, [allTransactions, now]);

  useEffect(() => {
    if (now === null) {
      return;
    }

    const query = format(now, "yyyy-MMMM");

    if (completedTansactionQueries.includes(query)) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getTransactionsByMonth(
          now.getMonth() + 1,
          now.getFullYear()
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
  }, [now, dispatch, completedTansactionQueries]);

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
