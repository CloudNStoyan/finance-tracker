import React, { FunctionComponent, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import SimpleTransitionStyled from "../styles/desktop/SimpleTransition.styled";

export type SimpleTransitionProps = {
  transitionIn: boolean;
  children: React.ReactNode | React.ReactNode[];
};

const SimpleTransition: FunctionComponent<SimpleTransitionProps> = ({
  children,
  transitionIn,
}) => {
  const nodeRef = useRef();

  console.log(transitionIn, nodeRef.current);

  return (
    <CSSTransition
      in={transitionIn}
      appear={true}
      nodeRef={nodeRef}
      timeout={250}
      classNames="transition-container"
    >
      <SimpleTransitionStyled ref={nodeRef}>{children}</SimpleTransitionStyled>
    </CSSTransition>
  );
};

export default SimpleTransition;
