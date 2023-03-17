import { useEffect, useRef, useState } from "react";
import { Chart, ArcElement, ChartData, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, getElementAtEvent } from "react-chartjs-2";
import { Category, Transaction } from "../server-api";
import DefaultCategory from "../state/DefaultCategory";
import { IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  addMonths,
  format,
  getTime,
  parseJSON,
  setDate,
  subMonths,
} from "date-fns";
import SearchTransaction from "../components/SearchTransaction";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import CategoryStat from "../components/CategoryStat";
import {
  fetchStartBalance,
  setNow as setNowCalendar,
  setStartBalance,
} from "../state/calendarSlice";
import { fetchTransactionsByRange } from "../state/transactionSlice";
import {
  fromUnixTimeMs,
  StripTimeFromDate,
} from "../infrastructure/CustomDateUtils";
import { fetchCategories } from "../state/categorySlice";
import { lastDayOfMonth } from "date-fns/esm";
import { GetTransactionOccurrencessInDates } from "../infrastructure/TransactionsBuisnessLogic";
import { styled } from "../infrastructure/ThemeManager";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export interface CategoryData {
  [name: string]: number;
}

const StatisticsPageStyled = styled.div`
  display: flex;
  max-height: calc(100vh - 50px);
  flex-flow: column nowrap;

  .transaction-list {
    overflow: hidden;
    overflow-y: scroll;
    margin: 10px 0;
    max-width: 100vw;
  }

  .categories-list {
    max-width: 100vw;
  }

  .chart {
    flex: 0 0 250px;
    box-shadow: 0 6px 7px rgb(0 0 0 / 5%);
    padding-bottom: 20px;
  }
`;

const GenerateChartDataset = (data: CategoryData, categories: Category[]) => {
  if (!data || Object.keys(data).length === 0) {
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
  if (transactions === null || transactions.length === 0) {
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
  const [currentTransactions, setCurrentTransactions] = useState<Transaction[]>(
    []
  );
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

  const chartRef = useRef();

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

  useEffect(() => setSelectedCatId(null), [chart]);

  useEffect(() => {
    setIncomes(GenerateData(currentTransactions, "income"));
    setExpenses(GenerateData(currentTransactions, "expense"));
  }, [currentTransactions]);

  useEffect(() => {
    const transactionRepeats: Transaction[][] = [];
    allTransactions.forEach((t) => {
      if (t.repeat === null) {
        return;
      }

      const transactionDate = parseJSON(t.transactionDate);

      const lastDay = lastDayOfMonth(now);
      const firstDay = setDate(StripTimeFromDate(now), 1);

      const transactions: Transaction[] = [];

      const dates = GetTransactionOccurrencessInDates(
        firstDay,
        lastDay,
        transactionDate,
        t.repeat,
        t.repeatEvery,
        t.repeatEndOccurrences
      );

      dates.forEach((date) => {
        const newTransaction = Object.assign({}, t);
        newTransaction.transactionDate = date.toJSON();
        transactions.push(newTransaction);
      });

      transactionRepeats.push(transactions);
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
    dispatch(setNowCalendar(getTime(now)));
  }, [now, dispatch]);

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
    <StatisticsPageStyled>
      <div className="flex flex-wrap flex-col items-center m-2">
        <div className="flex justify-center items-center">
          <IconButton onClick={() => setNow(subMonths(now, 1))}>
            <ChevronLeft />
          </IconButton>
          {now && (
            <span className="w-32 text-center">{format(now, "MMMM yyyy")}</span>
          )}
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
      {((incomesChartData && chart === "income") ||
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
      {((chart === "expense" && expensesChartData === null) ||
        (chart === "income" && incomesChartData === null)) && (
        <div className="text-center">
          No data for {chart === "income" ? "Incomes" : "Expenses"} from this
          month
        </div>
      )}
      {((chart === "expense" && expensesChartData) ||
        (chart === "income" && incomesChartData)) && (
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
      {bottomView === "categories" &&
        ((chart === "expense" && expenses) ||
          (chart === "income" && incomes)) && (
          <div className="categories-list flex flex-col p-2 pt-0 gap-2 mt-2">
            {Object.keys(chart === "income" ? incomes : expenses).map(
              (catId) => {
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
              }
            )}
          </div>
        )}
      {bottomView === "transactions" && currentTransactions && (
        <div className="transaction-list flex flex-col p-2 pt-0 gap-2">
          {currentTransactions
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
                key={`${transaction.transactionId}-${idx}`}
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
