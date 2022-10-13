import { styled } from "../../infrastructure/ThemeManager";

export type SearchTransactionStyledProps = {
  bgColor: string;
};

const SearchTransactionStyled = styled.button<SearchTransactionStyledProps>`
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
    text-overflow: ellipsis;
    min-width: 0;
    white-space: nowrap;
  }
`;

export default SearchTransactionStyled;
