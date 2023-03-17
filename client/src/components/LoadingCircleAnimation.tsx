import { CircularProgress } from "@mui/material";
import { FunctionComponent } from "react";
import LoadingCircleAnimationStyled from "./LoadingCircleAnimationStyled";

const LoadingCircleAnimation: FunctionComponent<{ className: string }> = ({
  className,
}) => {
  return (
    <LoadingCircleAnimationStyled className={className}>
      <CircularProgress className="loading-circle" />
    </LoadingCircleAnimationStyled>
  );
};

export default LoadingCircleAnimation;
