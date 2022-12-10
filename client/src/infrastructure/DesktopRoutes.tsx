import { Route, Routes } from "react-router-dom";
import DesktopCalendarPage from "../pages/desktop/DesktopCalendarPage";
import DesktopNotFoundPage from "../pages/desktop/DesktopNotFoundPage";
import DesktopStatisticsPage from "../pages/desktop/DesktopStatisticsPage";

const DesktopRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopCalendarPage />} />
      <Route path="/stats" element={<DesktopStatisticsPage />} />
      <Route path="*" element={<DesktopNotFoundPage />} />
    </Routes>
  );
};

export default DesktopRoutes;
