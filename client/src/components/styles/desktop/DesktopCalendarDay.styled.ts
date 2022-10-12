import { styled } from "../../../infrastructure/ThemeManager";

const DesktopCalendarDayStyled = styled.div`
  transition: opacity 0.25s linear;

  .date-number {
    font-size: 18px;
    font-weight: 500;
  }

  .stats {
    font-size: 16px;
  }

  .transactions {
    padding-left: 0.4em;
    margin-top: 5px;
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

  &.fade-off {
    opacity: 0.25 !important;
  }

  .open-modal-btn {
    animation-name: scale-animation;
    animation-duration: 0.25s;
  }

  .stats-numbers {
    animation-name: scale-animation;
    animation-duration: 0.25s;
  }

  @keyframes scale-animation {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

export default DesktopCalendarDayStyled;
