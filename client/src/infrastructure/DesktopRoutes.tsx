import { Route, Routes } from "react-router-dom";
import DesktopCalendarPage from "../pages/desktop/DesktopCalendarPage";
import DesktopLoginPage from "../pages/desktop/DesktopLoginPage";
import DesktopNotFoundPage from "../pages/desktop/DesktopNotFoundPage";
import DesktopRegisterPage from "../pages/desktop/DesktopRegisterPage";
import DesktopStatisticsPage from "../pages/desktop/DesktopStatisticsPage";

const DesktopRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopCalendarPage />} />
      <Route path="/login" element={<DesktopLoginPage />} />
      <Route path="/register" element={<DesktopRegisterPage />} />
      <Route path="/stats" element={<DesktopStatisticsPage />} />
      <Route path="*" element={<DesktopNotFoundPage />} />
    </Routes>
  );
};

export default DesktopRoutes;
