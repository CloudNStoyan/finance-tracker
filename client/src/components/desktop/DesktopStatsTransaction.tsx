import { AttachMoney } from "@mui/icons-material";
import { Button, styled } from "@mui/material";
import { format } from "date-fns";
import { FunctionComponent } from "react";
import Icons from "../../infrastructure/Icons";
import { Category, Transaction } from "../../server-api";
import { useAppSelector } from "../../state/hooks";
import DesktopStatsTransactionStyled from "../styles/desktop/DesktopStatsTransaction.styled";

export interface DesktopStatsTransactionProps {
  transaction: Transaction;
  category: Category;
  selectedCatId: (catId: number) => void;
}

const CustomButton = styled(Button)<{ props: { hoverColor: string } }>(
  ({ props }) => ({
    "&:hover": {
      backgroundColor: props.hoverColor,
    },
  })
);

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
