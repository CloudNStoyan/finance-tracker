import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./state/store";
import App from "./app";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import GlobalStyles from "./components/styles/Global.styled";
import ThemesComponent from "./components/ThemesComponent";
import Topbar from "./components/Topbar";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const root = createRoot(document.getElementById("app"));

root.render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<></>}>
        <ThemesComponent>
          <GlobalStyles />
          <Topbar />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="expenses" element={<h1>Expenses</h1>} />
              <Route path="invoices" element={<h1>Invoices</h1>} />
            </Routes>
          </BrowserRouter>
        </ThemesComponent>
      </Suspense>
    </Provider>
  </StrictMode>
);
