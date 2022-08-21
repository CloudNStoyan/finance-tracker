import { styled } from "../../infrastructure/ThemeManager";

const TransactionPageStyled = styled.div<{
  bgColor: string;
  isDarkMode: boolean;
}>`
  height: 100%;
  padding: 10px;
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#222" : "#f3f4f6")};
  display: flex;
  flex-flow: column nowrap;

  .repeat-end {
    display: flex;
    margin-left: 42px;
    height: 42px;
  }

  .type-selector {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#222" : "#f3f4f6")};
  }

  .description-input {
    background-color: ${({ theme }) => theme.colors.background};
    resize: none;
    border-color: ${({ isDarkMode }) => (isDarkMode ? "#444" : "#e1e2e2")};
  }

  .transaction-info {
    flex-grow: 1;
    margin-top: 20px;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-flow: column wrap;

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

    .label-button {
      padding: 0;
      color: ${({ isDarkMode }) => (isDarkMode ? "white" : "#333")};
      transition: none;
      height: 40px;

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

  .transaction-label {
    padding-right: 50px;
  }

  .fields {
    background-color: ${({ bgColor }) => bgColor};
    color: white;
    padding: 10px 0;
    border-radius: 10px;

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

export default TransactionPageStyled;
