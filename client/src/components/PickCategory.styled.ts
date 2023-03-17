import { styled } from "../infrastructure/ThemeManager";

const PickCategoryStyled = styled.div<{ bgColor: string }>`
  animation: custom-slide-bottom-up 0.25s;

  .wrapper {
    padding: 12px;
    width: 100%;
    display: flex;
    align-items: center;
    color: white;
    background-color: ${({ bgColor }) => bgColor};
    border-radius: 5px;
    -webkit-tap-highlight-color: transparent;
    gap: 5px;

    .icon {
      color: white;
    }
  }
`;

export default PickCategoryStyled;
