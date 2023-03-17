import { Button, CircularProgress, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecaptchaCheckbox from "../infrastructure/RecaptchaCheckbox";
import { resendVerificationEmail, verifyEmail } from "../server-api";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";
import VerifyEmailPageStyled from "./VerifyEmailPage.styled";

const VerifyEmailPage = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const { user, verificationToken } = useAppSelector(
    (state) => state.authReducer
  );
  const dispatch = useAppDispatch();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [recaptchaInstanceKey, setRecaptchaInstanceKey] = useState(
    new Date().getTime()
  );
  const navigate = useNavigate();

  const onRecaptchaSolve = useCallback(
    (token: string) => {
      setRecaptchaToken(token);
    },
    [setRecaptchaToken]
  );

  const onRecaptchaExpired = useCallback(() => {
    setRecaptchaToken(null);
  }, [setRecaptchaToken]);

  const initAccountVerification = async () => {
    if (!recaptchaToken || recaptchaToken.length === 0) {
      dispatch(
        setNotification({
          message: "Please solve the captcha!",
          color: "error",
        })
      );
      return;
    }

    if (!verifyToken || verifyToken.trim().length < 6) {
      setValidationError(true);
      return;
    }

    setLoading(true);
    setVerifyError(null);

    const response = await verifyEmail(verifyToken, recaptchaToken);

    setRecaptchaInstanceKey(new Date().getTime());

    setLoading(false);

    if (response === null) {
      navigate("/");
      return;
    }

    setVerifyError(response.error);
  };

  const initResendCode = async () => {
    if (!recaptchaToken || recaptchaToken.length === 0) {
      dispatch(
        setNotification({
          message: "Please solve the captcha!",
          color: "error",
        })
      );
      return;
    }

    setLoading(true);
    setVerifyError(null);

    setResendDisabled(true);

    await resendVerificationEmail(recaptchaToken);

    setRecaptchaInstanceKey(new Date().getTime());

    setLoading(false);

    dispatch(
      setNotification({ message: "A new email was sent.", color: "success" })
    );
  };

  useEffect(() => {
    if (!verificationToken) {
      return;
    }

    setVerifyToken(verificationToken);
  }, [verificationToken]);

  return (
    <VerifyEmailPageStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <form className={`px-2 pt-3 mb-8 pb-2 w-fit ${loading ? "loading" : ""}`}>
        <h1 className="dark:text-white">Account verification</h1>
        <p>
          An email with a verification code
          <br />
          was just sent to
        </p>
        <p>{user.email}</p>
        <div className="w-full flex justify-center mt-2">
          <TextField
            className="text-cyan-400 font-bold"
            variant="outlined"
            value={verifyToken}
            error={validationError}
            helperText={validationError ? "Verification code is required." : ""}
            onChange={(e) => {
              setVerifyToken(e.target.value);
              setVerifyError(null);
              setValidationError(false);
            }}
            onBlur={(e) => {
              setVerifyToken(e.target.value);
              setVerifyError(null);
              setValidationError(false);
            }}
            inputProps={{
              maxLength: 6,
              className: "dark:text-purple-400 text-blue-400 font-bold",
            }}
            disabled={loading}
            placeholder="......"
            color={verifyToken.trim().length < 6 ? "primary" : "success"}
            focused={verifyToken.trim().length === 6}
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
              void initAccountVerification();
            }}
            disabled={loading}
            color="primary"
          >
            Verify
          </Button>
        </div>
        <div className="flex flex-col items-center justify-between mt-2">
          <p className="mb-2">Didn&apos;t recieve email?</p>
          <Button
            onClick={(e) => {
              e.preventDefault();
              void initResendCode();
            }}
            className="w-full"
            disabled={resendDisabled || loading}
          >
            Request another one
          </Button>
        </div>
        {verifyError && (
          <div className="text-red-400 text-center mt-2">
            <p className="font-medium">Verification failed</p>
            <p>{verifyError}</p>
          </div>
        )}
      </form>
    </VerifyEmailPageStyled>
  );
};

export default VerifyEmailPage;
