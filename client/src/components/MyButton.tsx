import React, { FunctionComponent } from "react";
import { setCounter } from "../state/basicSlice";
import { useAppSelector } from "../state/hooks";
import { useAppDispatch } from "../state/hooks";

const Button: FunctionComponent = () => {
  const count = useAppSelector((state) => state.basicReducer.counter);
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();

        dispatch(setCounter(count + 1));
      }}
    >
      Click me {count}
    </button>
  );
};

export default Button;
