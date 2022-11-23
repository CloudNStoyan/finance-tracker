import { Route, Routes } from "react-router-dom";
import CalendarPage from "../pages/CalendarPage";
import CategoryPage from "../pages/CategoryPage";
import LoginPage from "../pages/LoginPage";
import ManageCategoriesPage from "../pages/ManageCategoriesPage";
import NotFoundPage from "../pages/NotFoundPage";
import RegisterPage from "../pages/RegisterPage";
import SearchPage from "../pages/SearchPage";
import StatisticsPage from "../pages/StatisticsPage";
import TransactionPage from "../pages/TransactionPage";

const MobileRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default MobileRoutes;
