import { FunctionComponent } from "react";
import PasswordHintsStyled from "./PasswordHints.styled";
import { useAppSelector } from "../state/hooks";

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
      {!/(?=.*[a-z])/.test(password) && (
        <div className="text-blue-400 border-blue-400 dark:text-purple-400 dark:border-purple-400">
          One lowercase letter
        </div>
      )}
      {!/(?=.*[A-Z])/.test(password) && (
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
      {!/(?=.*[0-9])/.test(password) && <div>One number</div>}
      {!/(?=.*[^A-Za-z0-9])/.test(password) && <div>One special character</div>}
    </PasswordHintsStyled>
  );
};

export default PasswordHints;
