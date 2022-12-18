import { Button, CircularProgress, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import RecaptchaCheckbox from "../../infrastructure/RecaptchaCheckbox";
import useQuery from "../../infrastructure/useQuery";
import { verifyEmail } from "../../server-api";
import DesktopVerifyEmailStyled from "../styles/desktop/DesktopVerifyEmail.styled";

const DesktopVerifyEmail = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string>(null);
  const [verifyToken, setVerifyToken] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [loading, setLoading] = useState(false);

  const query = useQuery();

  const email = query.get("email");

  useEffect(() => {
    const initialVerifyToken = query.get("token");

    setVerifyToken(initialVerifyToken);
  }, [query]);

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
      return;
    }

    setLoading(true);
    setVerifyError(null);

    const response = await verifyEmail(verifyToken, recaptchaToken);

    setLoading(false);

    if (response === null) {
      return;
    }

    setVerifyError(response.error);
  };

  return (
    <DesktopVerifyEmailStyled>
      {loading && <CircularProgress className="loading-circle" />}
      <form
        className={`rounded px-8 pt-6 pb-8 w-fit ${
          loading ? "opacity-50" : ""
        }`}
      >
        <h1>Finance Tracker</h1>
        <h2>Account verification</h2>
        <p>An email with a verification code was just sent to</p>
        <p>{email}</p>
        <div className="w-full flex justify-center mt-2">
          <TextField
            className="text-white"
            variant="outlined"
            value={verifyToken}
            onChange={(e) => {
              setVerifyToken(e.target.value);
              setVerifyError(null);
            }}
            onBlur={(e) => {
              setVerifyToken(e.target.value);
              setVerifyError(null);
            }}
            inputProps={{
              maxLength: 6,
            }}
            disabled={loading}
            placeholder="******"
          />
        </div>
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
              void initAccountVerification();
            }}
            disabled={loading}
            color="primary"
          >
            Verify
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
