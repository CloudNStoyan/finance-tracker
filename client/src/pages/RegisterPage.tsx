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
import RegisterPageStyled from "./styles/RegisterPage.styled";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../components/PasswordStrengthIndicator";
import usePasswordStrength from "../components/usePasswordStrength";
import useAuth from "../components/useAuth";
import { useAppDispatch } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";
import RecaptchaCheckbox from "../infrastructure/RecaptchaCheckbox";
import PasswordHints from "../components/PasswordHints";
import { clearError } from "../state/authSlice";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, color, text] = usePasswordStrength(password);
  const [showPassword, setShowPassword] = useState(false);

  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const { register, authStatus, authError } = useAuth();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const validateFields = () => {
    const usernameIsValid = username.trim().length >= 6;
    if (!usernameIsValid) {
      setUsernameError("Too short");
    }

    const passwordIsValid = score >= 2;
    setPasswordError(!passwordIsValid);

    const fieldsAreValid = usernameIsValid === true && passwordIsValid === true;

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

  const initRegister = () => {
    setLoading(true);

    const fieldsAreValid = validateFields();

    if (fieldsAreValid === false) {
      setLoading(false);
      return;
    }

    void register({ username, password, recaptchaToken });
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
              className={`mr-1 icon ${usernameError ? "mb-6" : "mb-1"}`}
            />
            <TextField
              className="w-full"
              label="Username"
              variant="standard"
              value={username}
              error={usernameError.length > 0}
              helperText={usernameError}
              onChange={(e) => {
                if (e.target.value.trim().length < 6) {
                  setUsernameError("Too short");
                } else {
                  setUsernameError("");
                }

                setUsername(e.target.value);
              }}
              onBlur={(e) => {
                if (e.target.value.trim().length < 6) {
                  setUsernameError("Too short");
                } else {
                  setUsernameError("");
                }

                setUsername(e.target.value);
              }}
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
                type={showPassword ? "text" : "password"}
                variant="standard"
                value={password}
                error={passwordError}
                helperText={passwordError ? "Password is too weak." : ""}
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
              variant="contained"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();

                initRegister();
              }}
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
