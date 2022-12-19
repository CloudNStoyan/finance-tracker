import { Button, CircularProgress, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import RecaptchaCheckbox from "../../infrastructure/RecaptchaCheckbox";
import { resendVerificationEmail, verifyEmail } from "../../server-api";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setNotification } from "../../state/notificationSlice";
import DesktopVerifyEmailStyled from "../styles/desktop/DesktopVerifyEmail.styled";

const DesktopVerifyEmail = () => {
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
    <DesktopVerifyEmailStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <div></div>
      <form
        className={`rounded px-8 pt-6 pb-8 w-fit ${loading ? "loading" : ""}`}
      >
        <h1>Account verification</h1>
        <p>An email with a verification code was just sent to</p>
        <p>{user.email}</p>
        <div className="w-full flex justify-center mt-2">
          <TextField
            className="text-white"
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
    </DesktopVerifyEmailStyled>
  );
};

export default DesktopVerifyEmail;
