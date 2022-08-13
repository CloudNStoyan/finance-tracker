import { styled } from "../../../infrastructure/ThemeManager";

const DesktopCalendarDayStyled = styled.div`
  .date-number {
    font-size: 18px;
    font-weight: 500;
  }

  .stats {
    font-size: 16px;
  }

  .transactions {
    overflow: hidden;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      width: 0.4em;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.scrollBar};
      border-radius: 6px;
    }
  }
`;

export default DesktopCalendarDayStyled;
