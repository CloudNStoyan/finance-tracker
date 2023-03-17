import { format } from "date-fns";
import { FunctionComponent } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "../infrastructure/Icons";
import { styled } from "../infrastructure/ThemeManager";
import { Category, Transaction } from "../server-api";

export interface SearchTransactionProps {
  transaction: Transaction;
  category: Category;
}

const SearchTransactionStyled = styled.button<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    white-space: nowrap;
  }
`;

const SearchTransaction: FunctionComponent<SearchTransactionProps> = ({
  transaction,
  category,
}) => {
  const navigate = useNavigate();
  const transactionDate = new Date(transaction.transactionDate);

  return (
    <SearchTransactionStyled
      onClick={() => navigate(`/transaction/${transaction.transactionId}`)}
      bgColor={category.bgColor}
      className="text-white flex flex-col rounded p-2"
    >
      <div className="flex w-full">
        <div>{Icons[category.icon]}</div>
        <div className="ml-2 mr-1">
          {transaction.type === "expense" ? "-" : "+"}
          {transaction.value}
        </div>
        <div className="label">{transaction.label}</div>
        <div className="ml-auto mr-2 pl-2 whitespace-nowrap">
          {category.name}
        </div>
      </div>
      <div className="w-full flex justify-between">
        <div className="ml-1">{format(transactionDate, "dd MMM")}</div>
        <div className="mr-2">{format(transactionDate, "yyyy")}</div>
      </div>
    </SearchTransactionStyled>
  );
};

export default SearchTransaction;
