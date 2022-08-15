import { styled } from "../../infrastructure/ThemeManager";

const SettingsPageStyled = styled.div<{ isDarkMode: boolean }>`
  width: 320px;

  .heading {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid;
    border-bottom-color: ${({ isDarkMode }) =>
      isDarkMode ? "#444" : "#e9e9e9"};

    h1 {
      font-size: 20px;
    }

    margin-bottom: 20px;
  }

  .container {
    padding: 10px;
  }
`;

export default SettingsPageStyled;
