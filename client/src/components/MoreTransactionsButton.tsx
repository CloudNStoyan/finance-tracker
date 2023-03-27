import { FunctionComponent } from "react";
import { styled } from "../infrastructure/ThemeManager";

interface MoreTransactionsButtonProps {
  moreTransactionsCount: number;
  onClick: () => void;
}

const MoreTransactionsButtonStyled = styled.button`
  font-size: 12px;
  font-weight: 600;
  text-align: left;
`;

const MoreTransactionsButton: FunctionComponent<
  MoreTransactionsButtonProps
> = ({ moreTransactionsCount, onClick }) => {
  return (
    <MoreTransactionsButtonStyled
      className="text-blue-500 dark:text-purple-500"
      onClick={onClick}
    >
      +{moreTransactionsCount} other
    </MoreTransactionsButtonStyled>
  );
};

export default MoreTransactionsButton;
