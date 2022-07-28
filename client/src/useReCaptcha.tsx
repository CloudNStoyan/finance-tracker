import { useEffect } from "react";

export type ReCaptchaCallback = (token: string) => Promise<void>;

const RECAPTCHA_SITE_KEY = "6LdbFKQcAAAAAINGHQjTEo3Z6h4HmFHv6J-KCVHt";

declare const grecaptcha: {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, action: { action: string }) => Promise<string>;
};

const useReCaptcha = () => {
  const generateToken = (onTokenCallback: ReCaptchaCallback) => {
    grecaptcha.ready(() => {
      grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action: "submit" })
        .then((token) => onTokenCallback(token))
        .catch((err) => console.error(err));
    });
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
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

  return [generateToken];
};

export default useReCaptcha;
