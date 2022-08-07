import { styled } from "../../infrastructure/ThemeManager";

const CalendarPageStyled = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 0 10px;

  > * {
    flex: 14%;
  }
`;

export default CalendarPageStyled;
