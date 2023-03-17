import { AttachMoney } from "@mui/icons-material";
import { Button, styled as muiStyled } from "@mui/material";
import { format } from "date-fns";
import { FunctionComponent } from "react";
import Icons from "../../infrastructure/Icons";
import { styled } from "../../infrastructure/ThemeManager";
import { Category, Transaction } from "../../server-api";
import { useAppSelector } from "../../state/hooks";

export interface DesktopStatsTransactionProps {
  transaction: Transaction;
  category: Category;
  selectedCatId: (catId: number) => void;
}

const CustomButton = muiStyled(Button)<{ props: { hoverColor: string } }>(
  ({ props }) => ({
    "&:hover": {
      backgroundColor: props.hoverColor,
    },
  })
);

interface DesktopStatsTransactionStyledProps {
  bgColor: string;
  isDarkMode: boolean;
}

const DesktopStatsTransactionStyled = styled.div<DesktopStatsTransactionStyledProps>`
  animation: custom-scale-0-1 0.25s;

  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};

  .cats {
    background-color: ${({ bgColor }) => bgColor};
    display: flex;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
  }
`;

const DesktopStatsTransaction: FunctionComponent<
  DesktopStatsTransactionProps
> = ({ transaction, category, selectedCatId }) => {
  const transactionDate = new Date(transaction.transactionDate);

  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  return (
    <DesktopStatsTransactionStyled
      bgColor={category.bgColor}
      isDarkMode={isDarkMode}
      className="flex items-center p-2"
    >
      <div className="">
        <div className="text-gray-500 dark:text-white flex items-center value">
          <AttachMoney />
          <div className="w-20">
            {transaction.type === "expense" ? "-" : "+"}
            {transaction.value.toFixed(2)}
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-100">
          {format(transactionDate, "dd MMM yyyy")}
        </div>
      </div>
      <div className="ml-3 dark:text-gray-100 grow">{transaction.label}</div>
      <CustomButton
        props={{ hoverColor: category.bgColor }}
        variant="text"
        color="inherit"
        className="cats flex"
        onClick={() => selectedCatId(category.categoryId ?? -1)}
      >
        <div>{Icons[category.icon]}</div>
        <div className="ml-2">{category.name}</div>
      </CustomButton>
    </DesktopStatsTransactionStyled>
  );
};

export default DesktopStatsTransaction;
