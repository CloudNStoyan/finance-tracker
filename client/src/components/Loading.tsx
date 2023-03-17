import { FunctionComponent, ReactNode } from "react";
import { useAppSelector } from "../state/hooks";
import LoadingStyled from "./Loading.styled";

export interface LoadingProps {
  children: ReactNode | ReactNode[];
}

const Loading: FunctionComponent<LoadingProps> = ({ children }) => {
  const isLoading = useAppSelector((state) => state.mainReducer.isLoading);
  const { checkedSession, status } = useAppSelector(
    (state) => state.authReducer
  );

  return isLoading || (!checkedSession && status === "loading") ? (
    <LoadingStyled className="flex justify-center items-center">
      <div className="loading-container"></div>
    </LoadingStyled>
  ) : (
    <>{children}</>
  );
};

export default Loading;
