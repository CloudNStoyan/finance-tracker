import { styled } from "../../../infrastructure/ThemeManager";

const DesktopCalendarTransactionStyled = styled.button<{ bgColor: string }>`
  font-size: 12px;
  background-color: ${({ bgColor }) => bgColor};
  color: white;
  width: 100%;
  margin-bottom: 2px;
  margin-top: 2px;

  .label {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export default DesktopCalendarTransactionStyled;
