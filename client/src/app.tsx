import { lazy, useEffect } from "react";
import axios from "axios";
import { useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./state/hooks";
import { fetchMe, setVerificationToken } from "./state/authSlice";
import { Route, Routes, useNavigate } from "react-router-dom";
import useQuery from "./infrastructure/useQuery";
import DesktopVerifyEmail from "./pages/desktop/DesktopVerifyEmail";

const DesktopAuthRoutes = lazy(
  () => import("./infrastructure/DesktopAuthRoutes")
);
const MobileAuthRoutes = lazy(
  () => import("./infrastructure/MobileAuthRoutes")
);
const DesktopRoutes = lazy(() => import("./infrastructure/DesktopRoutes"));
const MobileRoutes = lazy(() => import("./infrastructure/MobileRoutes"));

axios.defaults.withCredentials = true;

const App = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const autenticationStatus = useAppSelector(
    (state) => state.authReducer.status
  );
  const { isLoggedIn, sessionKey, user } = useAppSelector(
    (state) => state.authReducer
  );

  const query = useQuery();

  const token = query.get("verification_token");

  if (token) {
    dispatch(setVerificationToken(token));
  }

  useEffect(() => {
    if (autenticationStatus != "idle") {
      return;
    }

    void dispatch(fetchMe());
  }, [dispatch, autenticationStatus]);

  useEffect(() => {
    if (!isLoggedIn || autenticationStatus !== "succeeded") {
      return;
    }

    navigate("/");
  }, [isLoggedIn, autenticationStatus, navigate]);

  useEffect(() => {
    if (!sessionKey) {
      return;
    }

    document.cookie = `__session__=${sessionKey}`;
  }, [sessionKey]);

  if (!isLoggedIn) {
    return isDesktop ? <DesktopAuthRoutes /> : <MobileAuthRoutes />;
  }

  if (!user.activated) {
    return (
      <Routes>
        <Route path="*" element={<DesktopVerifyEmail />} />
      </Routes>
    );
  }

  return isDesktop ? <DesktopRoutes /> : <MobileRoutes />;
};

export default App;
