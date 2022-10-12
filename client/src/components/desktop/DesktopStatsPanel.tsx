import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import { Chart, ArcElement, ChartData, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Doughnut, getElementAtEvent } from "react-chartjs-2";
import DefaultCategory from "../../state/DefaultCategory";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import CategoryStat from "../../components/CategoryStat";
import { useAppSelector } from "../../state/hooks";
import { CategoryData } from "../../pages/StatisticsPage";
import DesktopStatsTransaction from "./DesktopStatsTransaction";
import { Transaction } from "../../server-api";

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export type DesktopStatsPanelProps = {
  chartType: "income" | "expense";
  chartData: ChartData<"doughnut">;
  categoryData: CategoryData;
  allTransactions: Transaction[];
};

const DesktopStatsPanel: FunctionComponent<DesktopStatsPanelProps> = ({
  chartData,
  categoryData,
  chartType,
  allTransactions,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const chartRef = useRef();

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const [bottomView, setBottomView] = useState<"transactions" | "categories">(
    "transactions"
  );

  useEffect(() => {
    const filteredTransactions = allTransactions.filter((transaction) => {
      if (transaction.type !== chartType) {
        return;
      }

      if (selectedCatId === -1 && transaction.categoryId === null) {
        return transaction;
      }

      if (selectedCatId && transaction.categoryId !== selectedCatId) {
        return;
      }

      return transaction;
    });

    setTransactions(filteredTransactions);
  }, [allTransactions, chartType, selectedCatId]);

  return (
    <div className="chart-wrapper">
      {chartData === null && (
        <div className="text-center">
          No data for {chartType === "income" ? "Incomes" : "Expenses"} from
          this month
        </div>
      )}
      {chartData && (
        <>
          <h1 className="text-center text-3xl">
            {chartType === "expense" ? "Expenses" : "Incomes"}
          </h1>
          <div className="relative chart" onBlur={(e) => console.log(e)}>
            <Doughnut
              height={300}
              onClick={(e) => {
                const selectedEl = getElementAtEvent(chartRef.current, e);
                if (selectedEl.length === 0) {
                  setSelectedCatId(null);
                  return;
                }
                const selectedCatName = chartData.labels[selectedEl[0].index];

                const catId =
                  categories.find((cat) => cat.name === selectedCatName)
                    ?.categoryId ?? -1;

                setSelectedCatId(selectedCatId !== catId ? catId : null);
              }}
              ref={chartRef}
              data={chartData}
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
        </>
      )}
      {chartData && (
        <div className="mt-4 flex mr-2">
          <h1 className="text-center text-3xl flex-1">
            {chartType === "expense" ? "Expenses" : "Incomes"}
          </h1>
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
      {bottomView === "categories" && chartData && (
        <div className="categories-list flex flex-col p-2 pt-0 gap-2 mt-2">
          {Object.keys(categoryData).map((catId) => {
            const catTotalValues = Object.values(categoryData).reduce(
              (a, b) => a + b,
              0
            );

            const totalValue = categoryData[catId];

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
          {transactions.map((transaction, idx) => (
            <DesktopStatsTransaction
              key={idx}
              transaction={transaction}
              category={
                categories.find(
                  (cat) => cat.categoryId === transaction.categoryId
                ) ?? DefaultCategory
              }
              selectedCatId={(catId: number) => {
                if (selectedCatId === catId) {
                  setSelectedCatId(null);
                  return;
                }

                setSelectedCatId(catId);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DesktopStatsPanel;
