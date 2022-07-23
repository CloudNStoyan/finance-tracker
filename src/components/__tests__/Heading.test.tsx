import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Heading from "../MyHeading";

test("heading renders properly", () => {
  const { queryByTestId } = render(<Heading text="Testing 123" />);

  const heading = queryByTestId("heading");

  expect(heading.textContent).toBe("Testing 123");
});
