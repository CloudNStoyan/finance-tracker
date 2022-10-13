import { styled } from "../../infrastructure/ThemeManager";

const PickCategoryStyled = styled.div<{ bgColor: string }>`
  animation: slide-up-anim 0.25s;

  @keyframes slide-up-anim {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0);
    }
  }

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
