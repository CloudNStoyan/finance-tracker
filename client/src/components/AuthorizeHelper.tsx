import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchMe } from "../state/authSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

const AuthorizeHelper = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.authReducer.isLoggedIn);

  const autenticationStatus = useAppSelector(
    (state) => state.authReducer.status
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (autenticationStatus != "idle") {
      return;
    }

    void dispatch(fetchMe());
  }, [dispatch, autenticationStatus]);

  useEffect(() => {
    const accessablePaths = ["/login", "/register"];

    if (isLoggedIn && accessablePaths.includes(location.pathname)) {
      navigate("/");
    }

    if (isLoggedIn || autenticationStatus === "loading") {
      return;
    }

    if (
      !accessablePaths.includes(location.pathname) &&
      autenticationStatus === "failed"
    ) {
      navigate("/login");
    }
  }, [isLoggedIn, autenticationStatus, location, navigate]);
  return null;
};

export default AuthorizeHelper;
