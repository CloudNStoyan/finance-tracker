import React, { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import {
  Category,
  getCategories,
  getTransactionsByMonth,
  Transaction,
} from "../../server-api";
import axios from "axios";
import DefaultCategory from "../../state/DefaultCategory";
import { IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { addMonths, format, getTime, isBefore, subMonths } from "date-fns";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  setCategories,
  setTransactions,
  setNow as setNowCalendar,
} from "../../state/calendarSlice";
import DesktopStatisticsPageStyled from "../styles/desktop/DesktopStatisticsPage.styled";
import DesktopStatsPanel from "../../components/desktop/DesktopStatsPanel";

export type CategoryData = { [name: string]: number };

const GenerateChartDataset = (data: CategoryData, categories: Category[]) => {
  if (Object.keys(data).length === 0) {
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

  return catTotals;
};

const DesktopStatisticsPage = () => {
  const [now, setNow] = useState(new Date());
  const [expenses, setExpenses] = useState<CategoryData>();
  const [incomes, setIncomes] = useState<CategoryData>();
  const [expensesChartData, setExpensesChartData] =
    useState<ChartData<"doughnut">>();
  const [incomesChartData, setIncomesChartData] =
    useState<ChartData<"doughnut">>();
  const dispatch = useAppDispatch();
  const { categories, transactions, transactionCache } = useAppSelector(
    (state) => state.calendarReducer
  );
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  useEffect(() => {
    if (categories.length > 0) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setCategories(resp.data));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [categories, dispatch]);

  useEffect(() => {
    if (!expenses || categories.length === 0) {
      return;
    }

    const dataset = GenerateChartDataset(expenses, categories);
    setExpensesChartData(dataset);
  }, [expenses, categories]);

  useEffect(() => {
    if (!incomes || categories.length === 0) {
      return;
    }

    const dataset = GenerateChartDataset(incomes, categories);
    setIncomesChartData(dataset);
  }, [incomes, categories]);

  useEffect(() => {
    setIncomes(GenerateData(transactions, "income"));
    setExpenses(GenerateData(transactions, "expense"));
  }, [transactions]);

  useEffect(() => {
    dispatch(setNowCalendar(getTime(now)));
  }, [now, dispatch]);

  useEffect(() => {
    const key = format(now, "yyyy-MMMM");

    const cachedTransactions = transactionCache[key];

    if (Array.isArray(cachedTransactions)) {
      dispatch(setTransactions(cachedTransactions));
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

        const transactions = resp.data;
        transactions.sort((a, b) =>
          isBefore(new Date(a.transactionDate), new Date(b.transactionDate))
            ? 1
            : -1
        );

        dispatch(setTransactions(transactions));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [now, dispatch, transactions, transactionCache]);

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
          chartType="expense"
        />
        <div className="splitter"></div>
        <DesktopStatsPanel
          chartData={incomesChartData}
          categoryData={incomes}
          chartType="income"
        />
      </div>
    </DesktopStatisticsPageStyled>
  );
};

export default DesktopStatisticsPage;
