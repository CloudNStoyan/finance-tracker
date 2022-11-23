import { Button, CircularProgress, TextField } from "@mui/material";
import { PersonOutlined, LockOutlined } from "@mui/icons-material";
import { useState } from "react";
import useReCaptcha from "../../useReCaptcha";
import { Link, useNavigate } from "react-router-dom";
import { register, ServerError } from "../../server-api";
import axios, { AxiosError } from "axios";
import PasswordStrengthIndicator from "../../components/PasswordStrengthIndicator";
import usePasswordStrength from "../../components/usePasswordStrength";
import DesktopRegisterPageStyled from "../styles/desktop/DesktopRegisterPage.styled";

const DesktopRegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [error, setError] = useState<string>(null);
  const [loading, setLoading] = useState(false);
  const [score, color, text] = usePasswordStrength(password);
  const [shakeErrors, setShakeErrors] = useState(false);

  const [generateToken] = useReCaptcha();
  const navigate = useNavigate();

  const validateFields = () => {
    const usernameIsValid = username.trim().length >= 6;
    if (!usernameIsValid) {
      setUsernameError("Too short");
    }

    const passwordIsValid = score >= 2;
    setPasswordError(!passwordIsValid);

    return usernameIsValid === true && passwordIsValid === true;
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

    generateToken(async (token) => {
      try {
        const resp = await register(username, password, token);

        if (resp.status !== 200) {
          return;
        }

        navigate("/login");
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }

        const serverError = error as AxiosError<ServerError>;

        if (error.code === "ERR_NETWORK") {
          setError("Something went wrong, try again later.");
          return;
        }

        if (serverError.response.status === 400) {
          setError(serverError.response.data.error);
          return;
        }
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <DesktopRegisterPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div className="wrapper h-full w-full">
        <form
          className={`rounded px-8 pt-6 pb-8 w-80 ${loading ? "loading" : ""} ${
            shakeErrors ? "shake-errors" : ""
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
                setError(null);
              }}
              onBlur={(e) => {
                if (e.target.value.trim().length < 6) {
                  setUsernameError("Too short");
                } else {
                  setUsernameError("");
                }

                setUsername(e.target.value);
                setError(null);
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
                type="password"
                variant="standard"
                value={password}
                error={passwordError}
                helperText={passwordError ? "Password is too weak." : ""}
                onChange={(e) => {
                  setPasswordError(e.target.value.trim().length === 0);
                  setPassword(e.target.value);
                  setError(null);
                }}
                onBlur={(e) => {
                  setPasswordError(e.target.value.trim().length === 0);
                  setPassword(e.target.value);
                  setError(null);
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
          <div className="text-sm text-gray-400 dark:text-white mb-3 w-fit mx-auto">
            {!/(?=.*[a-z])/.test(password) && (
              <div className="font-bold">• One lowercase letter</div>
            )}
            {!/(?=.*[A-Z])/.test(password) && (
              <div className="font-bold">• One uppercase letter</div>
            )}
            {password.length < 8 && (
              <div className="font-bold">• 8 or more characters</div>
            )}
            {!/(?=.*[0-9])/.test(password) && <div>• One number</div>}
            {!/(?=.*[^A-Za-z0-9])/.test(password) && (
              <div>• One special character</div>
            )}
          </div>
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
          {error && (
            <div className="text-red-400 text-center mt-2">
              <p>{error}</p>
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
