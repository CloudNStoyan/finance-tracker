import { useEffect, useState } from "react";

const ALL_CASE_LETTERS_REGEX = /(?=.*[a-z])(?=.*[A-Z])/;

const ALL_CASE_LETTERS_AND_NUMBERS_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/;

const VERY_STRONG_PASSWORD_REGEX =
  /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/;

const usePasswordStrength = (password: string): [number, string, string] => {
  const [score, setScore] = useState(0);
  const [color, setColor] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const passwordLength = password.trim().length;

    if (passwordLength >= 11 && VERY_STRONG_PASSWORD_REGEX.test(password)) {
      setScore(4);
      setText("strong");
      setColor("#2e7d32");
      return;
    }

    if (
      passwordLength > 9 &&
      ALL_CASE_LETTERS_AND_NUMBERS_REGEX.test(password)
    ) {
      setScore(3);
      setText("good");
      setColor("#1976d2");
      return;
    }

    if (passwordLength >= 8 && ALL_CASE_LETTERS_REGEX.test(password)) {
      setScore(2);
      setText("okay");
      setColor("#ffc107");
      return;
    }

    if (passwordLength >= 8) {
      setScore(1);
      setText("weak");
      setColor("#d32f2f");
      return;
    }

    if (passwordLength < 8) {
      setScore(0);
      setText("too short");
      setColor("");
      return;
    }
  }, [password]);

  return [score, color, text];
};

export default usePasswordStrength;
