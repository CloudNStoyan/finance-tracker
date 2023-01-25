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
import { Link } from "react-router-dom";
import DesktopLoginPageStyled from "../styles/desktop/DesktopLoginPage.styled";
import useAuth from "../../components/useAuth";
import RecaptchaCheckbox from "../../infrastructure/RecaptchaCheckbox";
import { useAppDispatch } from "../../state/hooks";
import { setNotification } from "../../state/notificationSlice";
import { clearError } from "../../state/authSlice";
import { ValidateEmail } from "../../infrastructure/Utils";

const ConvertServerErrorToHuman = (error: string) => {
  switch (error) {
    case "AccountNotFound":
      return "Your email and password do not match. Please try again.";
    case "AccountNotActivated":
      return "You have not activated your account yet. Please, check your inbox and confirm your account.";
  }

  return "General Error";
};

const DesktopLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shakeErrors, setShakeErrors] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [humanError, setHumanError] = useState<string>(null);
  const { login, authError, authStatus } = useAuth();
  const dispatch = useAppDispatch();
  const [recaptchaInstanceKey, setRecaptchaInstanceKey] = useState(
    new Date().getTime()
  );
  const [capsLockActive, setCapsLockActive] = useState(false);

  const validateFields = () => {
    const emailIsValid = ValidateEmail(email);
    setEmailError(!emailIsValid);

    const passwordIsValid = password.trim().length > 0;
    setPasswordError(!passwordIsValid);

    const fieldsAreValid = emailIsValid === true && passwordIsValid === true;

    return fieldsAreValid && recaptchaToken !== null;
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
    setRecaptchaInstanceKey(new Date().getTime());
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

  useEffect(() => {
    if (!authError || authError.trim().length === 0) {
      return;
    }

    setHumanError(ConvertServerErrorToHuman(authError));
  }, [authError]);

  return (
    <DesktopLoginPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={` rounded px-8 pt-6 pb-8 w-fit ${
            loading ? "loading" : ""
          } ${shakeErrors ? "shake-errors" : ""}`}
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
              type="email"
              helperText={emailError ? "Valid email is required." : ""}
              onChange={(e) => {
                setEmailError(!ValidateEmail(e.target.value));
                setEmail(e.target.value);
              }}
              onBlur={(e) => {
                setEmailError(!ValidateEmail(e.target.value));
                setEmail(e.target.value);
              }}
            />
          </div>
          <div className="mb-6 flex flex-row items-end">
            <LockOutlined
              className={`mr-1 icon ${
                passwordError || capsLockActive ? "mb-6" : "mb-1"
              }`}
            />
            <TextField
              data-testid="password-mui"
              className="w-full"
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="standard"
              value={password}
              error={passwordError}
              color={capsLockActive ? "warning" : "primary"}
              helperText={
                capsLockActive
                  ? "Caps lock is active"
                  : passwordError
                  ? "Password is required."
                  : ""
              }
              onKeyDown={(e) =>
                setCapsLockActive(e.getModifierState("CapsLock"))
              }
              onChange={(e) => {
                setPasswordError(e.target.value.trim().length === 0);
                setPassword(e.target.value);
              }}
              onBlur={(e) => {
                setPasswordError(e.target.value.trim().length === 0);
                setPassword(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <RecaptchaCheckbox
            key={recaptchaInstanceKey}
            onSolve={onRecaptchaSolve}
            onExpired={onRecaptchaExpired}
          />
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

          {humanError && (
            <div className="text-red-400 text-center mt-2 human-error">
              <p className="font-medium">Login failed</p>
              <p>{humanError}</p>
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
