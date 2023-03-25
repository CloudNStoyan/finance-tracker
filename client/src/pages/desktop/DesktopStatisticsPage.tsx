import { useEffect, useState } from "react";
import { ChartData } from "chart.js";
import { Category, Transaction } from "../../server-api";
import DefaultCategory from "../../state/DefaultCategory";
import { format, lastDayOfMonth, parseJSON, setDate } from "date-fns";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { fetchStartBalance, setStartBalance } from "../../state/calendarSlice";
import DesktopStatisticsPageStyled from "./DesktopStatisticsPage.styled";
import DesktopStatsPanel from "../../components/desktop/DesktopStatsPanel";
import { fetchTransactionsByRange } from "../../state/transactionSlice";
import {
  fromUnixTimeMs,
  StripTimeFromDate,
} from "../../infrastructure/CustomDateUtils";
import { fetchCategories } from "../../state/categorySlice";
import { GetTransactionOccurrencessInDates } from "../../infrastructure/TransactionsBuisnessLogic";

export interface CategoryData {
  [name: string]: number;
}

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

  const { days, startBalanceCache, now } = useAppSelector(
    (state) => state.calendarReducer
  );

  const [parsedNow, setParsedNow] = useState<Date>(fromUnixTimeMs(now));

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  useEffect(() => {
    setParsedNow(fromUnixTimeMs(now));
  }, [now]);

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
    if (!parsedNow) {
      return;
    }

    const transactionRepeats: Transaction[][] = [];

    allTransactions.forEach((t) => {
      if (t.repeat === null) {
        return;
      }

      const transactionDate = parseJSON(t.transactionDate);

      const lastDay = lastDayOfMonth(parsedNow);
      const firstDay = setDate(StripTimeFromDate(parsedNow), 1);

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
            transactionDate.getMonth() === parsedNow.getMonth() &&
            transactionDate.getFullYear() === parsedNow.getFullYear()
          );
        })
        .sort(
          (a, b) =>
            new Date(a.transactionDate).getTime() -
              new Date(b.transactionDate).getTime() || a.value - b.value
        )
    );
  }, [allTransactions, parsedNow]);

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

    void dispatch(fetchStartBalance(fromUnixTimeMs(days[0])));
  }, [parsedNow, dispatch, startBalanceCache, days, balanceFetchingStatus]);

  useEffect(() => {
    if (
      parsedNow === null ||
      transactionsStatus !== "idle" ||
      days.length === 0
    ) {
      return;
    }

    const query = format(parsedNow, "yyyy-MMMM");

    if (completedTansactionQueries.includes(query)) {
      return;
    }

    void dispatch(
      fetchTransactionsByRange({
        after: fromUnixTimeMs(days[0]),
        before: fromUnixTimeMs(days[days.length - 1]),
        now: parsedNow.getTime(),
      })
    );
  }, [
    dispatch,
    completedTansactionQueries,
    days,
    parsedNow,
    transactionsStatus,
  ]);

  return (
    <DesktopStatisticsPageStyled isDarkMode={isDarkMode}>
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
