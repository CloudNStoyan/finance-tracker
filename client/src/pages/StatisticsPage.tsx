import React, { useEffect, useRef, useState } from "react";
import { Chart, ArcElement, ChartData, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, getElementAtEvent } from "react-chartjs-2";
import {
  Category,
  getCategories,
  getTransactionsByMonth,
  Transaction,
} from "../server-api";
import axios from "axios";
import DefaultCategory from "../state/DefaultCategory";
import StatisticsPageStyled from "./styles/StatisticsPage.styled";
import { IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { addMonths, format, getTime, isBefore, subMonths } from "date-fns";
import SearchTransaction from "../components/SearchTransaction";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import CategoryStat from "../components/CategoryStat";
import {
  setCategories,
  setTransactions,
  setNow as setNowCalendar,
} from "../state/calendarSlice";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

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

const StatisticsPage = () => {
  const [now, setNow] = useState(new Date());
  const [expenses, setExpenses] = useState<CategoryData>();
  const [incomes, setIncomes] = useState<CategoryData>();
  const [expensesChartData, setExpensesChartData] =
    useState<ChartData<"doughnut">>();
  const [incomesChartData, setIncomesChartData] =
    useState<ChartData<"doughnut">>();
  const [chart, setChart] = useState<"income" | "expense">("expense");
  const [selectedCatId, setSelectedCatId] = useState<number | null>();
  const [bottomView, setBottomView] = useState<"transactions" | "categories">(
    "categories"
  );
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);
  const { categories, transactions, transactionCache } = useAppSelector(
    (state) => state.calendarReducer
  );
  const chartRef = useRef();

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

  useEffect(() => setSelectedCatId(null), [chart]);

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
    <StatisticsPageStyled>
      <div className="flex flex-wrap flex-col items-center m-2">
        <div className="flex justify-center items-center">
          <IconButton onClick={() => setNow(subMonths(now, 1))}>
            <ChevronLeft />
          </IconButton>
          {now && <span>{format(now, "MMMM yyyy")}</span>}
          <IconButton onClick={() => setNow(addMonths(now, 1))}>
            <ChevronRight />
          </IconButton>
        </div>
        <div>
          <ToggleButtonGroup
            color="primary"
            size="small"
            value={chart}
            exclusive
            onChange={(e, v: "expense" | "income") => {
              if (v === null) {
                return;
              }

              setChart(v);
            }}
          >
            <ToggleButton value="expense">Expenses</ToggleButton>
            <ToggleButton value="income">Incomes</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>
      {((expensesChartData && incomesChartData) ||
        (incomesChartData && chart === "income") ||
        (expensesChartData && chart === "expense")) && (
        <div className="relative chart" onBlur={(e) => console.log(e)}>
          <Doughnut
            onClick={(e) => {
              const selectedEl = getElementAtEvent(chartRef.current, e);
              if (selectedEl.length === 0) {
                setSelectedCatId(null);
                return;
              }
              const selectedCatName = (
                chart === "expense" ? expensesChartData : expensesChartData
              ).labels[selectedEl[0].index];

              const catId =
                categories.find((cat) => cat.name === selectedCatName)
                  ?.categoryId ?? -1;

              setSelectedCatId(selectedCatId !== catId ? catId : null);
            }}
            ref={chartRef}
            data={chart === "income" ? expensesChartData : expensesChartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                datalabels: {
                  labels: {
                    value: {
                      font: {
                        weight: "bold",
                      },
                      color: "#fff",
                    },
                  },
                  formatter: (value: number, ctx) => {
                    let sum = 0;
                    const dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map((data: number) => {
                      sum += data;
                    });
                    const percentage =
                      Math.round((value * 100) / sum).toString() + "%";
                    return percentage;
                  },
                },
                legend: {
                  display: true,
                  labels: {
                    font: {
                      weight: "bold",
                    },
                    color: isDarkMode ? "white" : "#333",
                  },
                },
              },
            }}
          />
        </div>
      )}
      {((incomesChartData === null && expensesChartData === null) ||
        (incomes === null && chart === "income") ||
        (expensesChartData === null && chart === "expense")) && (
        <div className="text-center">
          No data for {chart === "income" ? "Incomes" : "Expenses"} from this
          month
        </div>
      )}
      {(expensesChartData || incomesChartData) && (
        <div className="mt-4 flex justify-end mr-2">
          <ToggleButtonGroup
            color="primary"
            size="small"
            value={bottomView}
            exclusive
            onChange={(e, v: "transactions" | "categories") => {
              if (v === null) {
                return;
              }

              setBottomView(v);
            }}
          >
            <ToggleButton value="transactions">Transactions</ToggleButton>
            <ToggleButton value="categories">Categories</ToggleButton>
          </ToggleButtonGroup>
        </div>
      )}
      {bottomView === "categories" && (expensesChartData || incomesChartData) && (
        <div className="categories-list flex flex-col p-2 pt-0 gap-2 mt-2">
          {Object.keys(chart === "income" ? incomes : expenses).map((catId) => {
            const chartData = chart === "income" ? incomes : expenses;

            const catTotalValues = Object.values(chartData).reduce(
              (a, b) => a + b,
              0
            );

            const totalValue = chartData[catId];

            const percentage = Math.round(
              (totalValue / catTotalValues) * 100
            ).toString();

            const category =
              categories.find((c) => c.categoryId === Number(catId)) ??
              DefaultCategory;

            return (
              <CategoryStat
                total={totalValue}
                percentage={percentage}
                category={category}
                key={category.categoryId ?? -1}
              />
            );
          })}
        </div>
      )}
      {bottomView === "transactions" && transactions && (
        <div className="transaction-list flex flex-col p-2 pt-0 gap-2">
          {transactions
            .filter((transaction) => {
              if (transaction.type !== chart) {
                return;
              }

              if (selectedCatId === -1 && transaction.categoryId === null) {
                return transaction;
              }

              if (selectedCatId && transaction.categoryId !== selectedCatId) {
                return;
              }

              return transaction;
            })
            .map((transaction, idx) => (
              <SearchTransaction
                key={idx}
                transaction={transaction}
                category={
                  categories.find(
                    (cat) => cat.categoryId === transaction.categoryId
                  ) ?? DefaultCategory
                }
              />
            ))}
        </div>
      )}
    </StatisticsPageStyled>
  );
};

export default StatisticsPage;
