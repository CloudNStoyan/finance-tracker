import { styled } from "../../infrastructure/ThemeManager";

export type TransactionInlineStyledProps = {
  bgColor: string;
};

const TransactionInlineStyled = styled.button<TransactionInlineStyledProps>`
  background-color: ${({ bgColor }) => bgColor};
`;

export default TransactionInlineStyled;
