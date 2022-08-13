import React, { lazy } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import DesktopCalendarPage from "./pages/desktop/DesktopCalendarPage";
import { useMediaQuery } from "@mui/material";
const StatisticsPage = lazy(() => import("./pages/StatisticsPage"));
const TransactionPage = lazy(() => import("./pages/TransactionPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ManageCategoriesPage = lazy(() => import("./pages/ManageCategoriesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

axios.defaults.withCredentials = true;

const App = () => {
  const isDesktop = useMediaQuery("(min-width:800px)");
  return (
    <Routes>
      <Route
        path="/"
        element={isDesktop ? <DesktopCalendarPage /> : <CalendarPage />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route>
        <Route
          path="/transaction/:transactionId"
          element={<TransactionPage hasTransactionId={true} />}
        />
        <Route
          path="/transaction"
          element={<TransactionPage hasTransactionId={false} />}
        />
      </Route>
      <Route>
        <Route
          path="/category/:categoryId"
          element={<CategoryPage hasCategoryId={true} />}
        />
        <Route
          path="/category"
          element={<CategoryPage hasCategoryId={false} />}
        />
      </Route>
      <Route path="/categories" element={<ManageCategoriesPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/stats" element={<StatisticsPage />} />
      <Route path="*" element={<h2>404</h2>} />
    </Routes>
  );
};

export default App;
