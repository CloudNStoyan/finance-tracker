import { Navigate, Route, Routes } from "react-router-dom";
import DesktopLandingPage from "../pages/desktop/DesktopLandingPage";
import DesktopLoginPage from "../pages/desktop/DesktopLoginPage";
import DesktopRegisterPage from "../pages/desktop/DesktopRegisterPage";

const DesktopAuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopLandingPage />} />
      <Route path="/login" element={<DesktopLoginPage />} />
      <Route path="/register" element={<DesktopRegisterPage />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default DesktopAuthRoutes;
