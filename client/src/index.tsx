import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./state/store";
import "./index.css";
import GlobalStyles from "./components/styles/Global.styled";
import ThemesComponent from "./components/ThemesComponent";
import Topbar from "./components/Topbar";
import LoadingHelper from "./components/LoadingHelper";
import Loading from "./components/Loading";
import App from "./app";
import { BrowserRouter } from "react-router-dom";
import SnackbarHelper from "./components/SnackbarHelper";
import AuthorizeHelper from "./components/AuthorizeHelper";

const root = createRoot(document.getElementById("app"));

root.render(
  <StrictMode>
    <Provider store={store}>
      <ThemesComponent>
        <BrowserRouter>
          <AuthorizeHelper />
          <GlobalStyles />
          <Topbar />
          <Loading>
            <Suspense fallback={<LoadingHelper />}>
              <App />
            </Suspense>
          </Loading>
          <SnackbarHelper />
        </BrowserRouter>
      </ThemesComponent>
    </Provider>
  </StrictMode>
);
