import React, { lazy, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./state/hooks";
import { getMe } from "./server-api";
import { setUser } from "./state/authSlice";
const TransactionPage = lazy(() => import("./pages/TransactionPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ManageCategoriesPage = lazy(() => import("./pages/ManageCategoriesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

axios.defaults.withCredentials = true;

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getMe();

        if (resp.status === 404) {
          return;
        }

        if (resp.status !== 200) {
          return;
        }

        dispatch(setUser(resp.data));
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [dispatch]);

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
      <Route path="*" element={<h2>404</h2>} />
    </Routes>
  );
};

export default App;
