import { lazy, useEffect } from "react";
import axios from "axios";
import { useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./state/hooks";
import { fetchMe } from "./state/authSlice";
import { useNavigate } from "react-router-dom";

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
  const { isLoggedIn } = useAppSelector((state) => state.authReducer);

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

  if (!isLoggedIn) {
    return isDesktop ? <DesktopAuthRoutes /> : <MobileAuthRoutes />;
  }

  return isDesktop ? <DesktopRoutes /> : <MobileRoutes />;
};

export default App;
