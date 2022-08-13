import { styled } from "../../../infrastructure/ThemeManager";

const DesktopTransactionStyled = styled.div<{
  bgColor: string;
  isDarkMode: boolean;
}>`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-flow: column nowrap;

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
