import { FunctionComponent } from "react";
import { styled } from "../../infrastructure/ThemeManager";
import { Category, Transaction } from "../../server-api";

export interface DesktopCalendarTransactionProps {
  transaction: Transaction;
  category: Category;
  onClick: () => void;
}

const DesktopCalendarTransactionStyled = styled.button<{ bgColor: string }>`
  font-size: 12px;
  background-color: ${({ bgColor }) => bgColor};
  color: white;
  width: 100%;
  margin-bottom: 2px;
  margin-top: 2px;

  .label {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

const DesktopCalendarTransaction: FunctionComponent<
  DesktopCalendarTransactionProps
> = ({ transaction, category, onClick }) => {
  return (
    <DesktopCalendarTransactionStyled
      onClick={onClick}
      bgColor={category.bgColor}
      className={`flex px-1 shadow rounded-sm ${
        !transaction.confirmed ? "opacity-50" : ""
      }`}
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
