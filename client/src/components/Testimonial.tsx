import { FunctionComponent } from "react";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import TestimonialStyled from "./Testimonial.styled";
import { TestimonialData } from "../state/static";

interface TestimonialProps {
  testimonial: TestimonialData;
}

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
