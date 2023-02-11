import { styled } from "../../infrastructure/ThemeManager";

const TestimonialStyled = styled.div`
  @keyframes testimonial-animation {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  animation: testimonial-animation 0.5s cubic-bezier(0.075, 0.82, 0.165, 1) 0s 1;
`;

export default TestimonialStyled;
