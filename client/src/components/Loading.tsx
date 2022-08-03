import React, { FunctionComponent } from "react";
import { useAppSelector } from "../state/hooks";
import LoadingStyled from "./styles/Loading.styled";

export type LoadingProps = {
  children: React.ReactNode | React.ReactNode[];
};

const Loading: FunctionComponent<LoadingProps> = ({ children }) => {
  const isLoading = useAppSelector((state) => state.mainReducer.isLoading);

  return isLoading ? (
    <LoadingStyled className="flex justify-center items-center">
      <div className="loading-container"></div>
    </LoadingStyled>
  ) : (
    <>{children}</>
  );
};

export default Loading;