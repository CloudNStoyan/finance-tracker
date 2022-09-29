import { styled } from "../../../infrastructure/ThemeManager";

const SimpleTransitionStyled = styled.div`
  &.transition-container-enter {
    animation-name: anim;
    animation-duration: 0.25s;
  }

  &.transition-container-exit-done {
    display: none;
  }

  @keyframes anim {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX();
    }
  }

  @keyframes anim-2 {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-100%);
    }
  }
`;

export default SimpleTransitionStyled;
