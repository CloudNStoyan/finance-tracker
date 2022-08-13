import { styled } from "../../../infrastructure/ThemeManager";

const DesktopCalendarTransactionStyled = styled.button<{ bgColor: string }>`
  font-size: 12px;
  background-color: ${({ bgColor }) => bgColor};
  color: white;
  margin: 5px;

  .label {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export default DesktopCalendarTransactionStyled;
