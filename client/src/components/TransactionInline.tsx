import { parseJSON } from "date-fns";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DateOnlyToString,
  DatesAreEqualWithoutTime,
} from "../infrastructure/CustomDateUtils";
import Icons from "../infrastructure/Icons";
import { Category, Transaction } from "../server-api";
import { useAppSelector } from "../state/hooks";
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
  const selected = useAppSelector((state) => state.calendarReducer.selected);
  const [parsedSelected, setParsedSelected] = useState<Date>(null);

  useEffect(() => {
    if (!selected) {
      return;
    }

    setParsedSelected(new Date(selected));
  }, [selected]);

  const handleClick = () => {
    const transactionDate = parseJSON(transaction.transactionDate);
    if (
      transaction.repeat !== null &&
      !DatesAreEqualWithoutTime(transactionDate, parsedSelected)
    ) {
      navigate(
        `/transaction/${
          transaction.transactionId
        }?initialDate=${DateOnlyToString(parsedSelected)}`
      );
      return;
    }

    navigate(`/transaction/${transaction.transactionId}`);
  };

  return (
    <TransactionInlineStyled
      onClick={handleClick}
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
