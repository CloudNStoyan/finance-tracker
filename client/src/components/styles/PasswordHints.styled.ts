import { styled } from "../../infrastructure/ThemeManager";

type PasswordHintsStyledProps = {
  isDarkMode: boolean;
};

const PasswordHintsStyled = styled.div<PasswordHintsStyledProps>`
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

export default PasswordHintsStyled;
