import { CircularProgress } from "@mui/material";
import { FunctionComponent } from "react";
import { styled } from "../infrastructure/ThemeManager";

const LoadingCircleAnimationStyled = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading-circle {
    position: absolute;
    z-index: 1;
  }
`;

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
