import { Button, CircularProgress, TextField } from "@mui/material";
import { PersonOutlined, LockOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import useReCaptcha from "../../useReCaptcha";
import { Link } from "react-router-dom";
import DesktopLoginPageStyled from "../styles/desktop/DesktopLoginPage.styled";
import useAuth from "../../components/useAuth";

const DesktopLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeErrors, setShakeErrors] = useState(false);
  const { login, authError, authStatus } = useAuth();

  const [generateToken] = useReCaptcha();

  const validateFields = () => {
    const usernameIsValid = username.trim().length > 0;
    setUsernameError(!usernameIsValid);

    const passwordIsValid = password.trim().length > 0;
    setPasswordError(!passwordIsValid);

    return usernameIsValid === true && passwordIsValid === true;
  };

  const initLogin = () => {
    setLoading(true);
    const fieldsAreValid = validateFields();

    if (fieldsAreValid === false) {
      setLoading(false);
      setShakeErrors(true);
      setTimeout(() => {
        setShakeErrors(false);
      }, 300);
      return;
    }

    generateToken((token) => {
      login({ username, password, recaptchaToken: token });
    });
  };

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }

    setLoading(false);
  }, [authStatus]);

  return (
    <DesktopLoginPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={` rounded px-8 pt-6 pb-8 w-80 ${
            loading ? "loading" : ""
          } ${shakeErrors ? "shake-errors" : ""}`}
        >
          <h1 className="text-center text-lg font-medium text-gray-600 mb-5 dark:text-white">
            Log in to Finance Tracker
          </h1>
          <div className="mb-4 flex flex-row items-end">
            <PersonOutlined
              className={`mr-1 icon ${usernameError ? "mb-6" : "mb-1"}`}
            />
            <TextField
              data-testid="username-mui"
              className="w-full text-white"
              label="Username"
              variant="standard"
              value={username}
              error={usernameError}
              helperText={usernameError ? "Username is required." : ""}
              onChange={(e) => {
                setUsernameError(e.target.value.trim().length === 0);
                setUsername(e.target.value);
              }}
              onBlur={(e) => {
                setUsernameError(e.target.value.trim().length === 0);
                setUsername(e.target.value);
              }}
            />
          </div>
          <div className="mb-6 flex flex-row items-end">
            <LockOutlined
              className={`mr-1 icon ${passwordError ? "mb-6" : "mb-1"}`}
            />
            <TextField
              data-testid="password-mui"
              className="w-full"
              label="Password"
              type="password"
              variant="standard"
              value={password}
              error={passwordError}
              helperText={passwordError ? "Password is required." : ""}
              onChange={(e) => {
                setPasswordError(e.target.value.trim().length === 0);
                setPassword(e.target.value);
              }}
              onBlur={(e) => {
                setPasswordError(e.target.value.trim().length === 0);
                setPassword(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="contained"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();

                initLogin();
              }}
              disabled={loading}
              color="primary"
            >
              Sign In
            </Button>
          </div>
          {authError && (
            <div className="text-red-400 text-center mt-2">
              <p className="font-medium">Login failed</p>
              <p>{authError}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400 font-medium text-center mt-3">
              Don&#39;t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-400 dark:text-purple-400"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </DesktopLoginPageStyled>
  );
};

export default DesktopLoginPage;
