import { FunctionComponent } from "react";
import { Category } from "../server-api";
import CategoryStatStyled from "./styles/CategoryStat.styled";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useAppSelector } from "../state/hooks";

export interface CategoryStatProps {
  percentage: string;
  total: number;
  category: Category;
}

const CategoryStat: FunctionComponent<CategoryStatProps> = ({
  category,
  percentage,
  total,
}) => {
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  return (
    <CategoryStatStyled bgColor={category.bgColor} isDarkMode={isDarkMode}>
      <div className="flex items-center min-w-0">
        <div className="percentage">{percentage}%</div>
        <div className="ml-2 cat-name">{category.name}</div>
      </div>
      <div className="text-gray-500 dark:text-white flex items-center value">
        <AttachMoneyIcon />
        <div>{total.toFixed(2)}</div>
      </div>
    </CategoryStatStyled>
  );
};

export default CategoryStat;
