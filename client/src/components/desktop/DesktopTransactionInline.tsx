import { FunctionComponent } from "react";
import Icons from "../../infrastructure/Icons";
import { styled } from "../../infrastructure/ThemeManager";
import { Category, Transaction } from "../../server-api";

interface DesktopTransactionInlineProps {
  transaction: Transaction;
  category: Category;
  onClick: () => void;
}

const DesktopTransactionInlineStyled = styled.button<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;

  .label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const DesktopTransactionInline: FunctionComponent<
  DesktopTransactionInlineProps
> = ({ transaction, category, onClick }) => {
  return (
    <DesktopTransactionInlineStyled
      bgColor={category.bgColor}
      className="text-white flex rounded p-2"
      onClick={onClick}
    >
      <div>{Icons[category.icon]}</div>
      <div className="ml-2 mr-1">
        {transaction.type === "expense" ? "-" : "+"}
        {transaction.value}
      </div>
      <div className="label">{transaction.label}</div>
      <div className="ml-auto mr-2">{category.name}</div>
    </DesktopTransactionInlineStyled>
  );
};

export default DesktopTransactionInline;
