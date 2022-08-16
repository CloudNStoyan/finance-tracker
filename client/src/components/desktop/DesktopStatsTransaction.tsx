import { AttachMoney } from "@mui/icons-material";
import { format } from "date-fns";
import React, { FunctionComponent } from "react";
import Icons from "../../infrastructure/Icons";
import { Category, Transaction } from "../../server-api";
import { useAppSelector } from "../../state/hooks";
import DesktopStatsTransactionStyled from "../styles/desktop/DesktopStatsTransaction.styled";

export type DesktopStatsTransactionProps = {
  transaction: Transaction;
  category: Category;
};

const DesktopStatsTransaction: FunctionComponent<
  DesktopStatsTransactionProps
> = ({ transaction, category }) => {
  const transactionDate = new Date(transaction.transactionDate);

  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  return (
    <DesktopStatsTransactionStyled
      bgColor={category.bgColor}
      isDarkMode={isDarkMode}
      className="flex flex-col p-2"
    >
      <div className="flex w-full justify-between">
        <div className="flex items-center text-gray-700">
          <div className="text-gray-500 dark:text-white flex items-center value">
            <AttachMoney />
            <div className="w-20">
              {transaction.type === "expense" ? "-" : "+"}
              {transaction.value.toFixed(2)}
            </div>
          </div>
          <div className="ml-3 dark:text-gray-100">{transaction.label}</div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="text-gray-500 dark:text-gray-100">
          {format(transactionDate, "dd MMM yyyy")}
        </div>
        <div className="cats flex">
          <div>{Icons[category.icon]}</div>
          <div className="ml-2">{category.name}</div>
        </div>
      </div>
    </DesktopStatsTransactionStyled>
  );
};

export default DesktopStatsTransaction;
