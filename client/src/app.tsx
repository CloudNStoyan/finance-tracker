import { lazy, useEffect, useRef } from "react";
import axios from "axios";
import { useMediaQuery } from "@mui/material";
import { useAppDispatch, useAppSelector } from "./state/hooks";
import { fetchMe, setVerificationToken } from "./state/authSlice";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width:1024px)");
  const themeMetaRef = useRef<HTMLMetaElement>();
  const faviconRef = useRef<HTMLLinkElement>();
  const authenticationStatus = useAppSelector(
    (state) => state.authReducer.status
  );
  const { isLoggedIn, user } = useAppSelector((state) => state.authReducer);

  const { colors } = useAppSelector((state) => state.themeReducer.styledTheme);
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);

  const query = useQuery();

  const token = query.get("verification_token");

  useEffect(() => {
    if (!themeMetaRef.current) {
      themeMetaRef.current = document.createElement("meta");
      themeMetaRef.current.setAttribute("name", "theme-color");
      document.head.appendChild(themeMetaRef.current);
    }

    themeMetaRef.current.setAttribute("content", colors.topbarBg);

    return () => {
      themeMetaRef.current.remove();
      themeMetaRef.current = null;
    };
  }, [colors]);

  useEffect(() => {
    if (!faviconRef.current) {
      faviconRef.current = document.createElement("link");
      faviconRef.current.setAttribute("rel", "icon");
      faviconRef.current.setAttribute(
        "href",
        isDarkMode ? "/dark_favicon.ico" : "/favicon.ico"
      );
      document.head.appendChild(faviconRef.current);
      return;
    }

    console.log(faviconRef.current.getAttribute("href"), isDarkMode);

    faviconRef.current.setAttribute(
      "href",
      isDarkMode ? "/dark_favicon.ico" : "/favicon.ico"
    );

    return () => {
      faviconRef.current.remove();
      faviconRef.current = null;
    };
  }, [isDarkMode]);

  if (token) {
    dispatch(setVerificationToken(token));
  }

  useEffect(() => {
    if (authenticationStatus !== "idle") {
      return;
    }

    void dispatch(fetchMe());
  }, [dispatch, authenticationStatus]);

  useEffect(() => {
    if (
      authenticationStatus !== "succeeded" ||
      location.pathname !== "/login"
    ) {
      return;
    }

    navigate("/");
  }, [navigate, authenticationStatus, location]);

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
