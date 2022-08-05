import React, { lazy, useEffect } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./state/hooks";
import { getMe } from "./server-api";
import { setUser } from "./state/authSlice";
import TransactionPage from "./pages/TransactionPage";
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ManageCategoriesPage = lazy(() => import("./pages/ManageCategoriesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

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
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/transaction" element={<TransactionPage />} />
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
      <Route path="*" element={<h2>404</h2>} />
    </Routes>
  );
};

export default App;
