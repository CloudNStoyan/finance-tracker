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
import LoadingHelper from "./components/LoadingHelper";
import Loading from "./components/Loading";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

const root = createRoot(document.getElementById("app"));

root.render(
  <StrictMode>
    <Provider store={store}>
      <ThemesComponent>
        <GlobalStyles />
        <Topbar />
        <Loading>
          <Suspense fallback={<LoadingHelper />}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<h2>404</h2>} />
              </Routes>
            </BrowserRouter>
          </Suspense>
        </Loading>
      </ThemesComponent>
    </Provider>
  </StrictMode>
);
