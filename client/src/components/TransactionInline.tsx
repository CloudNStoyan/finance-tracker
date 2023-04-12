import { parseJSON } from "date-fns";
import { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DateOnlyToString,
  DatesAreEqualWithoutTime,
} from "../infrastructure/CustomDateUtils";
import Icons from "../infrastructure/Icons";
import { styled } from "../infrastructure/ThemeManager";
import { Transaction } from "../server-api";
import { useAppSelector } from "../state/hooks";
import useCategory from "../infrastructure/useCategory";

const TransactionInlineStyled = styled.button<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;

  .label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export interface TransactionInlineProps {
  transaction: Transaction;
}

const TransactionInline: FunctionComponent<TransactionInlineProps> = ({
  transaction,
}) => {
  const navigate = useNavigate();
  const selected = useAppSelector((state) => state.calendarReducer.selected);
  const [parsedSelected, setParsedSelected] = useState<Date>(null);
  const category = useCategory(transaction.categoryId);

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
