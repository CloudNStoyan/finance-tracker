import axios from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe } from "../server-api";
import { setUser, triedToAuth } from "../state/authSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

let isFetching = false;

const AuthorizeHelper = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.authReducer.isLoggedIn);

  const didTryToAuthenticate = useAppSelector(
    (state) => state.authReducer.triedToAuth
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isFetching) {
      return;
    }

    isFetching = true;

    const fetchApi = async () => {
      try {
        const resp = await getMe();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setUser(resp.data));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      } finally {
        dispatch(triedToAuth());
        isFetching = false;
      }
    };

    void fetchApi();
  }, [dispatch]);

  useEffect(() => {
    const accessablePaths = ["/login", "/register"];

    if (isLoggedIn && accessablePaths.includes(location.pathname)) {
      navigate("/");
    }

    if (isLoggedIn || !didTryToAuthenticate) {
      return;
    }

    if (!accessablePaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [isLoggedIn, didTryToAuthenticate, location, navigate]);
  return null;
};

export default AuthorizeHelper;
