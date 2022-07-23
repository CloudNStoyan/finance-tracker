import React, { FunctionComponent } from "react";

export type HeadingProp = {
  text: string;
};

const Heading: FunctionComponent<HeadingProp> = ({ text }) => {
  return <h1 data-testid="heading">{text}</h1>;
};

export default Heading;
