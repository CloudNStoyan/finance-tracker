import { FunctionComponent } from "react";
import { styled } from "../infrastructure/ThemeManager";
import { useAppSelector } from "../state/hooks";

const LOWERCASE_LETTER_REGEX = /(?=.*[a-z])/;
const UPPERCASE_LETTER_REGEX = /(?=.*[A-Z])/;
const ONE_NUMBER_REGEX = /(?=.*[0-9])/;
const ONE_SPECIAL_CHAR_REGEX = /(?=.*[^A-Za-z0-9])/;

const PasswordHintsStyled = styled.div<{ isDarkMode: boolean }>`
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: 10px;
  padding: 5px;
  max-width: 320px;

  > div {
    border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#555" : "#cecece")};
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#222" : "#f5f5f5")};
    padding: 0 5px;
    font-weight: bold;
  }
`;

type PasswordHintsProps = {
  password: string;
};

const PasswordHints: FunctionComponent<PasswordHintsProps> = ({ password }) => {
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);
  return (
    <PasswordHintsStyled
      isDarkMode={isDarkMode}
      className="text-sm text-gray-400 dark:text-white mb-3 w-fit mx-auto"
    >
      {!LOWERCASE_LETTER_REGEX.test(password) && (
        <div className="text-blue-400 border-blue-400 dark:text-purple-400 dark:border-purple-400">
          One lowercase letter
        </div>
      )}
      {!UPPERCASE_LETTER_REGEX.test(password) && (
        <div className="text-blue-400 border-blue-400 dark:text-purple-400 dark:border-purple-400">
          One uppercase letter
        </div>
      )}
      {password.length < 8 && (
        <div className="text-blue-400 border-blue-400 dark:text-purple-400 dark:border-purple-400">
          {11 - password.length} more characters
        </div>
      )}
      {password.length >= 8 && password.length < 11 && (
        <div>{11 - password.length} more characters</div>
      )}
      {!ONE_NUMBER_REGEX.test(password) && <div>One number</div>}
      {!ONE_SPECIAL_CHAR_REGEX.test(password) && (
        <div>One special character</div>
      )}
    </PasswordHintsStyled>
  );
};

export default PasswordHints;
