import { lazy } from "react";
import axios from "axios";
import { useMediaQuery } from "@mui/material";
const DesktopRoutes = lazy(() => import("./infrastructure/DesktopRoutes"));
const MobileRoutes = lazy(() => import("./infrastructure/MobileRoutes"));

axios.defaults.withCredentials = true;

const App = () => {
  const isDesktop = useMediaQuery("(min-width:1024px)");

  return isDesktop ? <DesktopRoutes /> : <MobileRoutes />;
};

export default App;
