import React, { FunctionComponent } from "react";
import PasswordStrengthIndicatorStyled from "./styles/PasswordStrengthIndicator.styled";

const PasswordStrengthIndicator: FunctionComponent<{
  score: number;
  passwordLength: number;
  color: string;
  text: string;
}> = ({ score, passwordLength, color, text }) => {
  return (
    passwordLength > 0 && (
      <PasswordStrengthIndicatorStyled activeColor={color}>
        <div className="levels">
          <div className={`level ${score >= 1 ? "active" : ""}`}></div>
          <div className={`level ${score >= 2 ? "active" : ""}`}></div>
          <div className={`level ${score >= 3 ? "active" : ""}`}></div>
          <div className={`level ${score > 3 ? "active" : ""}`}></div>
        </div>
        <div className="flex flex-column flex-wrap text-sm">
          <span className="text-right block w-full uppercase font-semibold text-gray-500">
            {text}
          </span>
        </div>
      </PasswordStrengthIndicatorStyled>
    )
  );
};

export default PasswordStrengthIndicator;
