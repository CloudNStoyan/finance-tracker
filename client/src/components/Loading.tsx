import { FunctionComponent, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../state/hooks";
import LoadingStyled from "./styles/Loading.styled";

export type LoadingProps = {
  children: ReactNode | ReactNode[];
};

const Loading: FunctionComponent<LoadingProps> = ({ children }) => {
  const isLoading = useAppSelector((state) => state.mainReducer.isLoading);
  const triedToAuth = useAppSelector((state) => state.authReducer.triedToAuth);

  let isAuthenticating = true;

  const location = useLocation();

  const accessablePaths = ["/login", "/register"];

  if (!accessablePaths.includes(location.pathname)) {
    isAuthenticating = false;
  }

  return isLoading || !(triedToAuth || isAuthenticating) ? (
    <LoadingStyled className="flex justify-center items-center">
      <div className="loading-container"></div>
    </LoadingStyled>
  ) : (
    <>{children}</>
  );
};

export default Loading;
