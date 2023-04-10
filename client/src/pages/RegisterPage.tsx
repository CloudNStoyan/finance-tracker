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
import RegisterPageStyled from "./RegisterPage.styled";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import usePasswordStrength from "../components/usePasswordStrength";
import useAuth from "../components/useAuth";
import { useAppDispatch } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";
import RecaptchaCheckbox from "../infrastructure/RecaptchaCheckbox";
import PasswordHints from "../components/PasswordHints";
import { clearError } from "../state/authSlice";
import { CustomChangeEvent, ValidateEmail } from "../infrastructure/Utils";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, color, text] = usePasswordStrength(password);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const { register, authStatus, authError } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const showPassword = () => {
    setPasswordVisible(true);
  };

  const hidePassword = () => {
    setPasswordVisible(false);
  };

  const handleEmailChange = (e: CustomChangeEvent) => {
    if (!ValidateEmail(e.target.value)) {
      setEmailError("Invalid Email");
    } else {
      setEmailError("");
    }

    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: CustomChangeEvent) => {
    setPasswordError(e.target.value.trim().length === 0);
    setPassword(e.target.value);
  };

  const validateFields = () => {
    const emailIsValid = ValidateEmail(email);
    if (!emailIsValid) {
      setEmailError("Invalid Email");
    }

    const passwordIsValid = score >= 2;
    setPasswordError(!passwordIsValid);

    const fieldsAreValid = emailIsValid === true && passwordIsValid === true;

    if (recaptchaToken === null && fieldsAreValid) {
      dispatch(
        setNotification({
          message: "Please solve the captcha!",
          color: "error",
        })
      );
    }

    return fieldsAreValid && recaptchaToken !== null;
  };

  const onRegister = () => {
    setLoading(true);

    const fieldsAreValid = validateFields();

    if (fieldsAreValid === false) {
      setLoading(false);
      return;
    }

    void register({ email, password, recaptchaToken });
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

    if (authStatus === "succeeded") {
      navigate("/login");
      return;
    }

    setLoading(false);
  }, [authStatus, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <RegisterPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={`rounded px-2 pt-3 mb-8 pb-2 w-fit ${
            loading ? "opacity-50" : ""
          }`}
        >
          <h1 className="text-center text-lg font-medium text-gray-600 mb-5 dark:text-white">
            Sign up to Finance Tracker
          </h1>
          <div className="mb-4 flex flex-row items-end">
            <PersonOutlined
              className={`mr-1 icon ${emailError ? "mb-6" : "mb-1"}`}
            />
            <TextField
              className="w-full"
              label="Email"
              variant="standard"
              type="email"
              value={email}
              error={emailError.length > 0}
              helperText={emailError}
              onChange={handleEmailChange}
              onBlur={handleEmailChange}
            />
          </div>
          <div
            className={`mb-6 flex flex-row items-${
              password.length > 0 ? "center" : "end"
            }`}
          >
            <LockOutlined
              className={`mr-1 icon ${passwordError ? "mb-6" : "mb-1"}`}
            />
            <div className="w-full">
              <TextField
                className="w-full"
                label="Password"
                type={passwordVisible ? "text" : "password"}
                variant="standard"
                value={password}
                error={passwordError}
                helperText={passwordError ? "Password is too weak." : ""}
                onChange={handlePasswordChange}
                onBlur={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onTouchStart={showPassword}
                        onMouseDown={showPassword}
                        onTouchEnd={hidePassword}
                        onTouchCancel={hidePassword}
                        onTouchMove={hidePassword}
                        onMouseUp={hidePassword}
                        onMouseLeave={hidePassword}
                        title={
                          passwordVisible ? "Hide password" : "Show password"
                        }
                      >
                        {passwordVisible ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <PasswordStrengthIndicator
                color={color}
                text={text}
                score={score}
                passwordLength={password.length}
              />
            </div>
          </div>
          <PasswordHints password={password} />
          <RecaptchaCheckbox
            onSolve={onRecaptchaSolve}
            onExpired={onRecaptchaExpired}
          />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="contained"
              className="w-full"
              onClick={onRegister}
              disabled={loading}
            >
              Sign Up
            </Button>
          </div>
          {authError && (
            <div className="text-red-400 text-center mt-2">
              <p className="font-medium">Register failed</p>
              <p>{authError}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-400 font-medium text-center pt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 dark:text-purple-400">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </RegisterPageStyled>
  );
};

export default RegisterPage;
