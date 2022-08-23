import { styled } from "../../infrastructure/ThemeManager";

export type SearchTransactionStyledProps = {
  bgColor: string;
};

const SearchTransactionStyled = styled.button<SearchTransactionStyledProps>`
  background-color: ${({ bgColor }) => bgColor};

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    white-space: nowrap;
  }
`;

export default SearchTransactionStyled;
