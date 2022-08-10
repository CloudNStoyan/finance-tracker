import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import LoginPage from "../LoginPage";
import { BrowserRouter } from "react-router-dom";
import ThemesComponent from "../../components/ThemesComponent";
import { store } from "../../state/store";
import { Provider } from "react-redux";

test("login renders properly", () => {
  const { getByText, getByTestId, queryByText } = render(
    <Provider store={store}>
      <ThemesComponent>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </ThemesComponent>
    </Provider>
  );

  const loginButton = getByText(/Sign In/);

  fireEvent.click(loginButton);

  getByText(/Username is required/);
  getByText(/Password is required/);

  const usernameInput = getByTestId("username-mui").querySelector("input");

  fireEvent.change(usernameInput, {
    target: {
      value: "JonDoe",
    },
  });

  expect(queryByText(/Username is required/)).toBeNull();

  const passwordInput = getByTestId("password-mui").querySelector("input");

  fireEvent.change(passwordInput, {
    target: {
      value: "secretPassword360",
    },
  });

  expect(queryByText(/Password is required/)).toBeNull();
});
