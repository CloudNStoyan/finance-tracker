import { styled } from "../../infrastructure/ThemeManager";

const DesktopCalendarDayStyled = styled.div`
  transition: opacity 0.25s linear;
  animation: custom-scale-0-1 0.25s;

  &.today {
    .action-bar {
      background-color: ${({ theme }) => theme.colors.accentText};
    }
  }

  .date-number {
    font-size: 18px;
    font-weight: 500;
  }

  .stats {
    font-size: 16px;
  }

  .transactions {
    height: 100%;
    padding-left: 0.4em;
    margin-top: 5px;
    overflow: hidden;
  }

  &.fade-off {
    opacity: 0.25 !important;
  }

  .open-modal-btn {
    animation: custom-scale-0-1 0.25s;
  }

  .stats-numbers {
    animation: custom-scale-0-1 0.25s;
  }
`;

export default DesktopCalendarDayStyled;
