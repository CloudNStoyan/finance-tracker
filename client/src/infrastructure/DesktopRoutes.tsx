import React from "react";
import { Route, Routes } from "react-router-dom";
import DesktopCalendarPage from "../pages/desktop/DesktopCalendarPage";
import DesktopLoginPage from "../pages/desktop/DesktopLoginPage";
import DesktopRegisterPage from "../pages/desktop/DesktopRegisterPage";
import DesktopStatisticsPage from "../pages/desktop/DesktopStatisticsPage";

const DesktopRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DesktopCalendarPage />} />
      <Route path="/login" element={<DesktopLoginPage />} />
      <Route path="/register" element={<DesktopRegisterPage />} />
      <Route path="/stats" element={<DesktopStatisticsPage />} />
      <Route path="*" element={<h2>404</h2>} />
    </Routes>
  );
};

export default DesktopRoutes;
