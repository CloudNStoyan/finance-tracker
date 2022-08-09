import React, { useEffect, useRef, useState } from "react";
import { Chart, ArcElement, ChartData, Tooltip, Legend } from "chart.js";
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
import { Button, ButtonGroup, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { addMonths, format, isBefore, subMonths } from "date-fns";
import SearchTransaction from "../components/SearchTransaction";

Chart.register(ArcElement, Tooltip, Legend);

const GenerateData = (
  transactions: Transaction[],
  categories: Category[],
  type: "income" | "expense"
) => {
  if (transactions === null) {
    return null;
  }

  const catTotals: { [key: string]: number } = {};

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

  if (Object.keys(catTotals).length === 0) {
    return null;
  }

  return {
    labels: Object.keys(catTotals).map((catId) =>
      catId !== "default"
        ? categories.find((c) => c.categoryId === Number(catId)).name
        : DefaultCategory.name
    ),
    datasets: [
      {
        data: Object.values(catTotals),
        backgroundColor: Object.keys(catTotals).map((catId) =>
          catId !== "default"
            ? categories.find((c) => c.categoryId === Number(catId)).bgColor
            : DefaultCategory.bgColor
        ),
        hoverOffset: 4,
      },
    ],
  };
};

const StatisticsPage = () => {
  const [now, setNow] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ChartData<"doughnut">>();
  const [incomes, setIncomes] = useState<ChartData<"doughnut">>();
  const [chart, setChart] = useState<"income" | "expense">("expense");
  const [selectedCatId, setSelectedCatId] = useState<number | null>();
  const chartRef = useRef();

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        setCategories(resp.data);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);

  useEffect(() => setSelectedCatId(null), [chart]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getTransactionsByMonth(now.getMonth() + 1);

        if (resp.status !== 200) {
          return;
        }

        const transactions = resp.data;
        transactions.sort((a, b) =>
          isBefore(new Date(a.transactionDate), new Date(b.transactionDate))
            ? 1
            : -1
        );

        setTransactions(transactions.length === 0 ? null : transactions);

        setIncomes(GenerateData(transactions, categories, "income"));
        setExpenses(GenerateData(transactions, categories, "expense"));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [now, categories]);

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
        <div className="">
          <ButtonGroup disableElevation size="small">
            <Button
              onClick={() => setChart("expense")}
              variant={chart === "expense" ? "contained" : "outlined"}
            >
              Expenses
            </Button>
            <Button
              onClick={() => setChart("income")}
              variant={chart === "income" ? "contained" : "outlined"}
            >
              Incomes
            </Button>
          </ButtonGroup>
        </div>
      </div>
      {((incomes && expenses) ||
        (incomes && chart === "income") ||
        (expenses && chart === "expense")) && (
        <div className="relative chart" onBlur={(e) => console.log(e)}>
          <Doughnut
            onClick={(e) => {
              const selectedEl = getElementAtEvent(chartRef.current, e);
              if (selectedEl.length === 0) {
                setSelectedCatId(null);
                return;
              }
              const selectedCatName = (chart === "expense" ? expenses : incomes)
                .labels[selectedEl[0].index];

              const catId =
                categories.find((cat) => cat.name === selectedCatName)
                  ?.categoryId ?? -1;

              setSelectedCatId(selectedCatId !== catId ? catId : null);
            }}
            ref={chartRef}
            data={chart === "income" ? incomes : expenses}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: "#333",
                  },
                },
              },
            }}
          />
        </div>
      )}
      {((incomes === null && expenses === null) ||
        (incomes === null && chart === "income") ||
        (expenses === null && chart === "expense")) && (
        <div className="text-center">
          No data for {chart === "income" ? "Incomes" : "Expenses"} from this
          month
        </div>
      )}
      {transactions && (
        <div className="flex flex-col p-2 gap-2">
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
