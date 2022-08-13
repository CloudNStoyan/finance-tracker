import React, { FunctionComponent } from "react";
import { Category, Transaction } from "../../server-api";
import DesktopCalendarTransactionStyled from "../styles/desktop/DesktopCalendarTransaction.styled";

export type DesktopCalendarTransactionProps = {
  transaction: Transaction;
  category: Category;
  onClick: () => void;
};

const DesktopCalendarTransaction: FunctionComponent<
  DesktopCalendarTransactionProps
> = ({ transaction, category, onClick }) => {
  return (
    <DesktopCalendarTransactionStyled
      onClick={onClick}
      bgColor={category.bgColor}
      className="flex px-1 shadow rounded"
    >
      <div className="grow text-left label">{transaction.label}</div>
      <div>
        {transaction.type === "expense" ? "-" : "+"}
        {transaction.value}
      </div>
    </DesktopCalendarTransactionStyled>
  );
};

export default DesktopCalendarTransaction;
