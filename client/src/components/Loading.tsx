import { FunctionComponent, ReactNode } from "react";
import { styled } from "../infrastructure/ThemeManager";
import { useAppSelector } from "../state/hooks";

const LoadingStyled = styled.div`
  height: 100%;

  .loading-container {
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    animation-name: custom-growing-40;
    animation-duration: 1.1s;
    animation-iteration-count: infinite;

    border: 30px solid ${({ theme }) => theme.colors.background};
    outline: 5px solid ${({ theme }) => theme.colors.topbarBg};
  }
`;

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
