import { styled } from "../../infrastructure/ThemeManager";

export type TransactionInlineStyledProps = {
  bgColor: string;
};

const TransactionInlineStyled = styled.button<TransactionInlineStyledProps>`
  background-color: ${({ bgColor }) => bgColor};
  animation: slide-up-anim 0.25s;

  @keyframes slide-up-anim {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

  .label {
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export default TransactionInlineStyled;
