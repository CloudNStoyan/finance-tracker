import { IconButton } from "@mui/material";
import { FunctionComponent, useEffect, useRef, useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import { TestimonialData } from "../state/static";
import Testimonial from "./Testimonial";

interface TestimonialCarouselProps {
  className?: string;
}

const TestimonialCarousel: FunctionComponent<TestimonialCarouselProps> = ({
  className,
}) => {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number>();
  const [touchstartX, setTouchstartX] = useState(0);
  const [touchendX, setTouchendX] = useState(0);

  useEffect(() => {
    let nextIdx = index;
    if (touchendX < touchstartX) {
      nextIdx += 1;
    } else {
      nextIdx -= 1;
    }

    if (nextIdx < 0) {
      nextIdx = TestimonialData.length - 1;
    } else if (nextIdx >= TestimonialData.length) {
      nextIdx = 0;
    }

    setIndex(nextIdx);

    console.log(nextIdx, index);

    // we only want to update this on touchendX because if
    // we update it on index it will end up in a endless loop
    // and if we update it on touchstartX it will trigger too quickly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touchendX]);

  const testimonial = TestimonialData[index];

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      let nextIdx = index + 1;

      if (nextIdx >= TestimonialData.length) {
        nextIdx = 0;
      }

      setIndex(nextIdx);
    }, 5000);

    return () => clearInterval(intervalRef.current);
  });

  return (
    <div
      onTouchStart={(e) => setTouchstartX(e.changedTouches[0].screenX)}
      onTouchEnd={(e) => setTouchendX(e.changedTouches[0].screenX)}
      className="max-w-[900px] my-0 mx-auto overflow-hidden"
    >
      <div className={className}>
        <Testimonial key={testimonial.id} testimonial={testimonial} />
      </div>
      <div className="flex justify-center gap-4 mt-5">
        {TestimonialData.map((testimonial, i) => {
          return (
            <IconButton
              key={testimonial.id}
              className={`transition-transform ${
                index !== i ? "opacity-50 scale-75" : ""
              }`}
              onClick={() => setIndex(i)}
            >
              <CircleIcon fontSize="small" />
            </IconButton>
          );
        })}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
