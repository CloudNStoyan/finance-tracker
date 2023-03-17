import { FunctionComponent } from "react";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { TestimonialData } from "../state/static";
import { styled } from "../infrastructure/ThemeManager";

interface TestimonialProps {
  testimonial: TestimonialData;
}

const TestimonialStyled = styled.div`
  @keyframes testimonial-animation {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (prefers-reduced-motion) {
    animation: none !important;
  }

  animation: testimonial-animation 0.5s cubic-bezier(0.075, 0.82, 0.165, 1) 0s 1;
`;

const Testimonial: FunctionComponent<TestimonialProps> = ({ testimonial }) => {
  return (
    <TestimonialStyled className="flex text-center flex-col">
      <div className="text-lg">
        <FormatQuoteIcon />
        {testimonial.content}
        <FormatQuoteIcon />
      </div>
      <div className="font-bold text-lg mt-8">{testimonial.author}</div>
    </TestimonialStyled>
  );
};

export default Testimonial;
