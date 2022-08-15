import React, { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import { Category, Transaction } from "../server-api";
import TransactionInlineStyled from "./styles/TransactionInline.styled";

export type TransactionInlineProps = {
  transaction: Transaction;
  category: Category;
};

const TransactionInline: FunctionComponent<TransactionInlineProps> = ({
  transaction,
  category,
}) => {
  const navigate = useNavigate();

  return (
    <TransactionInlineStyled
      onClick={() => navigate(`/transaction/${transaction.transactionId}`)}
      bgColor={category.bgColor}
      className="text-white flex rounded p-2"
    >
      <div>{Icons[category.icon]}</div>
      <div className="ml-2 mr-1">
        {transaction.type === "expense" ? "-" : "+"}
        {transaction.value}
      </div>
      <div className="label">{transaction.label}</div>
      <div className="ml-auto mr-2">{category.name}</div>
    </TransactionInlineStyled>
  );
};

export default TransactionInline;
