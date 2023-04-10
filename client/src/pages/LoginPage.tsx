import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  PersonOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useCallback, useEffect, useState } from "react";
import LoginPageStyled from "./LoginPage.styled";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";
import useAuth from "../components/useAuth";
import RecaptchaCheckbox from "../infrastructure/RecaptchaCheckbox";
import { clearError } from "../state/authSlice";
import { CustomChangeEvent, ValidateEmail } from "../infrastructure/Utils";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const { login, authError, authStatus } = useAuth();

  const handleEmailChange = (e: CustomChangeEvent) => {
    setEmailError(e.target.value.trim().length === 0);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: CustomChangeEvent) => {
    setPasswordError(e.target.value.trim().length === 0);
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateFields = () => {
    const emailIsValid = ValidateEmail(email);
    setEmailError(!emailIsValid);

    const passwordIsValid = password.trim().length > 0;
    setPasswordError(!passwordIsValid);

    const fieldsAreValid = emailIsValid === true && passwordIsValid === true;

    return fieldsAreValid && recaptchaToken !== null;
  };

  const onLogin = () => {
    setLoading(true);
    const fieldsAreValid = validateFields();

    if (fieldsAreValid === false) {
      setLoading(false);

      if (recaptchaToken === null) {
        dispatch(
          setNotification({
            message: "Please solve the captcha!",
            color: "error",
          })
        );
      }

      return;
    }

    login({ email, password, recaptchaToken });
  };

  const onRecaptchaSolve = useCallback(
    (token: string) => {
      setRecaptchaToken(token);
    },
    [setRecaptchaToken]
  );

  const onRecaptchaExpired = useCallback(() => {
    setRecaptchaToken(null);
  }, [setRecaptchaToken]);

  useEffect(() => {
    if (authStatus === "loading") {
      return;
    }

    setLoading(false);
  }, [authStatus]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <LoginPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={`rounded px-2 pt-3 mb-8 pb-2 w-fit ${
            loading ? "opacity-50" : ""
          }`}
        >
          <h1 className="text-center text-lg font-medium text-gray-600 mb-5 dark:text-white">
            Log in to Finance Tracker
          </h1>
          <div className="mb-4 flex flex-row items-end">
            <PersonOutlined
              className={`mr-1 icon ${emailError ? "mb-6" : "mb-1"}`}
            />
            <TextField
              data-testid="email-mui"
              className="w-full text-white"
              label="Email"
              variant="standard"
              value={email}
              error={emailError}
              helperText={emailError ? "Valid email is required." : ""}
              type="email"
              onChange={handleEmailChange}
              onBlur={handleEmailChange}
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
              type={showPassword ? "text" : "password"}
              variant="standard"
              value={password}
              error={passwordError}
              helperText={passwordError ? "Password is required." : ""}
              onChange={handlePasswordChange}
              onBlur={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={togglePasswordVisibility}>
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <RecaptchaCheckbox
            onSolve={onRecaptchaSolve}
            onExpired={onRecaptchaExpired}
          />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="contained"
              className="w-full"
              onClick={onLogin}
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
    </LoginPageStyled>
  );
};

export default LoginPage;
