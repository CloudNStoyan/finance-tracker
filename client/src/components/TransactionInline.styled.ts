import { styled } from "../infrastructure/ThemeManager";

export interface TransactionInlineStyledProps {
  bgColor: string;
}

const TransactionInlineStyled = styled.button<TransactionInlineStyledProps>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;

  .label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default TransactionInlineStyled;
