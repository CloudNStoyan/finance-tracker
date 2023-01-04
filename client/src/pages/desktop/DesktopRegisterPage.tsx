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
import { useEffect, useState } from "react";
import RecaptchaCheckbox from "../../infrastructure/RecaptchaCheckbox";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";
import usePasswordStrength from "../../components/usePasswordStrength";
import DesktopRegisterPageStyled from "../styles/desktop/DesktopRegisterPage.styled";
import useAuth from "../../components/useAuth";
import { useAppDispatch } from "../../state/hooks";
import { setNotification } from "../../state/notificationSlice";
import PasswordHints from "../../components/PasswordHints";
import { clearError } from "../../state/authSlice";
import { ValidateEmail } from "../../infrastructure/Utils";

const DesktopRegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, color, text] = usePasswordStrength(password);
  const [shakeErrors, setShakeErrors] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, authStatus, authError } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validateFields = () => {
    const emailIsValid = true; // ValidateEmail(email);
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

  const initRegister = () => {
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

    void register({ email, password, recaptchaToken });
  };

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
    <DesktopRegisterPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={`rounded px-8 pt-6 pb-8 w-fit ${
            loading ? "loading" : ""
          } ${shakeErrors ? "shake-errors" : ""}`}
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
              onChange={(e) => {
                if (!ValidateEmail(e.target.value)) {
                  setEmailError("Invalid Email");
                } else {
                  setEmailError("");
                }

                setEmail(e.target.value);
              }}
              onBlur={(e) => {
                if (!ValidateEmail(e.target.value)) {
                  setEmailError("Invalid Email");
                } else {
                  setEmailError("");
                }

                setEmail(e.target.value);
              }}
            />
          </div>
          <div
            className={`mb-2 flex flex-row items-${
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
                        onTouchStart={() => setShowPassword(true)}
                        onMouseDown={() => setShowPassword(true)}
                        onTouchEnd={() => setShowPassword(false)}
                        onTouchCancel={() => setShowPassword(false)}
                        onTouchMove={() => setShowPassword(false)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        title={showPassword ? "Hide password" : "Show password"}
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
            onSolve={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
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
            <p className="text-sm text-gray-400 font-medium text-center mt-3">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 dark:text-purple-400">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </DesktopRegisterPageStyled>
  );
};

export default DesktopRegisterPage;
