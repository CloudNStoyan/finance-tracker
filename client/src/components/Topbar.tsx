import { useMediaQuery } from "@mui/material";
import { FunctionComponent } from "react";
import DesktopTopbar from "./desktop/DesktopTopbar";
import MobileTopbar from "./MobileTopbar";

const Topbar: FunctionComponent = () => {
  const isDesktop = useMediaQuery("(min-width:1024px)");

  return isDesktop ? <DesktopTopbar /> : <MobileTopbar />;
};

export default Topbar;
