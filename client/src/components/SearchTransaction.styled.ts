import { styled } from "../infrastructure/ThemeManager";

export interface SearchTransactionStyledProps {
  bgColor: string;
}

const SearchTransactionStyled = styled.button<SearchTransactionStyledProps>`
  background-color: ${({ bgColor }) => bgColor};
  animation: custom-slide-bottom-up 0.25s;

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    white-space: nowrap;
  }
`;

export default SearchTransactionStyled;
