import { styled } from "../../infrastructure/ThemeManager";

export type TransactionInlineStyledProps = {
  bgColor: string;
};

const TransactionInlineStyled = styled.button<TransactionInlineStyledProps>`
  background-color: ${({ bgColor }) => bgColor};

  .label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default TransactionInlineStyled;
