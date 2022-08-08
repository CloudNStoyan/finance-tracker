import { styled } from "../../infrastructure/ThemeManager";

export type SearchTransactionStyledProps = {
  bgColor: string;
};

const SearchTransactionStyled = styled.button<SearchTransactionStyledProps>`
  background-color: ${({ bgColor }) => bgColor};
`;

export default SearchTransactionStyled;
