import React, { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoryPage from "./pages/CategoryPage";
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="*" element={<h2>404</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
