import { styled } from "../../../infrastructure/ThemeManager";

const DesktopTransactionStyled = styled.div<{
  bgColor: string;
  isDarkMode: boolean;
  isLoading: boolean;
}>`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-flow: column nowrap;
  padding-top: 0 !important;

  ${({ isLoading }) =>
    isLoading
      ? `
    > *:not(.loading-wrapper) {
      opacity: 0.75;
    }
  `
      : null}

  .repeat-end {
    display: flex;
    margin-left: 42px;
    height: 42px;
  }

  .description-btn-text {
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 200px;
    white-space: nowrap;
  }

  .transaction-info {
    flex-grow: 1;
    margin-top: 20px;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-flow: column wrap;

    & > * {
      padding: 5px 0;
    }

    .repeat-selector-wrapper {
      .icon {
        color: #757575;
        width: 42px;
      }

      .repeat-select {
        font-weight: 500;

        ::before,
        ::after {
          border-bottom-color: transparent;
        }
      }
    }

    .date-picker-render {
      .date-picker-icon {
        color: #757575;
        width: 42px;
        height: 42px;
        padding: 9px;
      }

      .date-picker-input {
        height: 42px;

        align-items: center;
        justify-content: center;

        input {
          padding: 0;
          font-weight: 500;
        }
      }
    }

    ${({ isLoading }) =>
      isLoading
        ? `
      .checkbox-wrapper {
        .MuiSvgIcon-root {
          color: #757575;
        }
      }
      `
        : null}

    .label-button {
      padding: 0;
      color: ${({ isDarkMode }) => (isDarkMode ? "white" : "#333")};
      transition: none;
      height: 40px;

      &.Mui-disabled {
        color: rgba(0, 0, 0, 0.38);
      }

      .MuiButton-startIcon {
        width: 42px;
        margin: 0;
        padding: 0;
        justify-content: center;
        color: #757575;
      }

      .icon-btn {
        width: 42px;
      }

      span {
        font-weight: 500;
      }
    }

    .MuiFormControlLabel-root .MuiIconButton-root {
      width: 42px;
    }

    .MuiFormControlLabel-root {
      margin: 0;
    }

    .MuiFormControlLabel-label {
      font-weight: 500;
    }
  }

  .transaction-value {
    width: 120px;
  }

  .transaction-label,
  .transaction-value {
    .MuiFormHelperText-root {
      animation: custom-shake 0.4s linear;
      position: absolute;
      bottom: -25px;
      left: 0;
      width: fit-content;
      padding: 0 5px;
      font-size: 10px;
      color: orange;
      background-color: rgba(0, 0, 0, 0.5);
    }
  }

  .fields {
    background-color: ${({ bgColor }) => bgColor};
    color: white;
    padding: 20px 10px;

    .save-btn {
      position: absolute;
      bottom: -20px;
      right: 5px;
      box-shadow: 0 0 10px #333;
      z-index: 1;
    }

    .delete-btn {
      position: absolute;
      right: -5px;
      box-shadow: 0 0 10px #333;
    }

    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      -webkit-background-clip: text;
      background-clip: text;
    }

    .MuiInput-root:not(:focus)::before {
      border-bottom-color: white;
    }

    .MuiRadio-root path {
      color: ${({ isDarkMode }) => (isDarkMode ? "#e9e9e9" : "white")};
    }
  }
`;
export default DesktopTransactionStyled;
