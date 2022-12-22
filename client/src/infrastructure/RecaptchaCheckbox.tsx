import { Button } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import { useAppSelector } from "../state/hooks";

const RECAPTCHA_SITE_KEY = process.env.Recaptcha_Site_Key;

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export interface Grecaptcha {
  ready: (callback: () => void) => void;
  render: (container?: HTMLElement, config?: RecaptchaConfig) => number;
  reset: (id?: number) => void;
  execute: (id?: number) => void;
  getResponse: (id?: number) => string;
}

interface RecaptchaBaseConfig {
  sitekey: string;
  theme?: "light" | "dark";
  size?: "compact" | "normal" | "invisible";
  badge?: "bottomright" | "bottomleft" | "inline";
  tabindex?: number;
  hl?: string;
  isolated?: boolean;
}

type RecaptchaConfig = RecaptchaBaseConfig & {
  callback?: (response: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

interface RecaptchaCheckboxProps {
  onSolve: (token: string) => void;
  onExpired?: () => void;
  onError?: () => void;
  compact?: boolean;
}

const DoesRecaptchaClientExists = () => {
  // recaptcha doesn't have a built-in way to check if the client is initialized so this exists.
  try {
    // to check if client was initialized we call the grecaptcha.getResponse function.
    // if the client was initialized it will return an empty string, but if it was already initialized
    // it will throw an 'No reCAPTCHA clients exist. error.'
    window.grecaptcha.getResponse();
    return true;
  } catch (error: unknown) {
    // here we catch the error and check if the error contains an message
    const isErrorWithMessage =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string";

    // if there is an error with message we check if the message is the correct one
    if (
      !isErrorWithMessage ||
      error.message !== "No reCAPTCHA clients exist."
    ) {
      // if the message is not the correct one, we presume the error is something else and
      // just console.error it and we PRESUME that the client was initialized.
      console.error(error);
      return true;
    }

    // if we hit this point in the function that means the error was with a message and the message was
    // the correct one and we PRESUME that the client is not initialized.
    return false;
  }
};

const RecaptchaCheckbox: FunctionComponent<RecaptchaCheckboxProps> = ({
  onSolve,
  onExpired,
  onError,
  compact,
}) => {
  const divRef = useRef();
  const isDarkMode = useAppSelector((state) => state.themeReducer.isDarkMode);

  const initializedRecaptcha = useCallback(() => {
    const captchaClientExists = DoesRecaptchaClientExists();

    if (captchaClientExists) {
      return;
    }

    const containerEl: HTMLElement = divRef.current;

    window.grecaptcha.ready(() => {
      window.grecaptcha.render(containerEl, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: onSolve,
        "expired-callback": onExpired,
        "error-callback": onError,
        size: compact === true ? "compact" : undefined,
        theme: isDarkMode ? "dark" : "light",
      });
    });
  }, [compact, isDarkMode, onError, onExpired, onSolve]);

  const resetRecaptcha = () => {
    if (!window.grecaptcha || !divRef.current) {
      return;
    }

    try {
      window.grecaptcha.reset();
    } catch (error: unknown) {
      const isErrorWithMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as Record<string, unknown>).message === "string";

      if (
        !isErrorWithMessage ||
        error.message !== "No reCAPTCHA clients exist."
      ) {
        return;
      }

      initializedRecaptcha();
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    document.body.appendChild(script);

    return () => {
      script.remove();
      const reCaptchaImports = [
        ...Array.from(document.querySelectorAll(".grecaptcha-badge")).map(
          (x) => x.parentElement
        ),
        ...Array.from(
          document.querySelectorAll(
            'script[src*="https://www.gstatic.com/recaptcha/"]'
          )
        ),
      ];
      reCaptchaImports.forEach((el) => {
        if (el.tagName === "BODY") {
          return;
        }

        el.remove();
      });
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!window.grecaptcha) {
        return;
      }

      initializedRecaptcha();
      clearInterval(timer);
    }, 500);

    return () => clearInterval(timer);
  }, [initializedRecaptcha]);

  return (
    <div>
      <div
        ref={divRef}
        className="my-2 w-fit mx-auto"
        style={{ width: 304, height: 78 }}
      />
      <Button onClick={resetRecaptcha} className="my-2">
        Reset captcha
      </Button>
    </div>
  );
};

export default RecaptchaCheckbox;
