import { styled } from "../../../infrastructure/ThemeManager";

export interface DesktopCategoryModalStyledProps {
  categoryColor: string;
  isLoading: boolean;
}

const DesktopCategoryModalStyled = styled.div<DesktopCategoryModalStyledProps>`
  ${({ isLoading }) =>
    isLoading
      ? `
    > *:not(.loading-wrapper) {
      opacity: 0.75;
    }
  `
      : null}

  .fields {
    background-color: ${({ categoryColor }) => categoryColor};
    border-radius: 6px;
    transition: background-color 0.15s linear;
  }

  .fields-wrapper {
    border: 10px solid ${({ theme }) => theme.colors.background};
  }

  .save-btn {
    position: absolute;
    bottom: -20px;
    right: 5px;
    box-shadow: 0 0 10px #333;
  }

  .delete-btn {
    position: absolute;
    bottom: -20px;
    left: 5px;
    box-shadow: 0 0 10px #333;
  }

  .icon-color-container {
    height: 345px;
  }
`;

export default DesktopCategoryModalStyled;
