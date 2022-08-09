import axios from "axios";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getMe } from "../server-api";
import { setUser, triedToAuth } from "../state/authSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

const AuthorizeHelper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((state) => state.authReducer.isLoggedIn);

  const didTryToAuthenticate = useAppSelector(
    (state) => state.authReducer.triedToAuth
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
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
      }
    };

    void fetchApi();
  }, [dispatch]);

  useEffect(() => {
    if (isLoggedIn || !didTryToAuthenticate) {
      return;
    }

    const accessablePaths = ["/login", "/register"];

    if (!accessablePaths.includes(location.pathname)) {
      navigate("/login");
    }
  }, [isLoggedIn, didTryToAuthenticate, location, navigate]);
  return <></>;
};

export default AuthorizeHelper;
