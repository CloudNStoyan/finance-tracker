import { useEffect } from "react";
import { useAppDispatch } from "../state/hooks";
import { setIsLoading } from "../state/mainSlice";

const LoadingHelper = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setIsLoading(true));
    return () => {
      setTimeout(() => dispatch(setIsLoading(false)), 1000);
    };
  }, [dispatch]);

  return <></>;
};

export default LoadingHelper;
