import { styled } from "../../infrastructure/ThemeManager";

const CategoryStatStyled = styled.div<{ bgColor: string; isDarkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid
    ${({ isDarkMode }) => (isDarkMode ? "#444" : "#f0f0f0")};
  padding-bottom: 10px;
  margin-bottom: 10px;

  .percentage {
    background-color: ${({ bgColor }) => bgColor};
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
  }

  .cat-name {
    font-size: 20px;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .value {
    font-size: 20px;
  }
`;

export default CategoryStatStyled;
