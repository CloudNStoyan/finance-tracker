import { FunctionComponent } from "react";
import { styled } from "../infrastructure/ThemeManager";

const PasswordStrengthIndicatorStyled = styled.div<{ activeColor: string }>`
  .levels {
    display: flex;
    flex-flow: row nowrap;
    margin-top: 5px;
    gap: 5px;

    .level {
      flex: 1;
      overflow: hidden;

      &::after {
        content: "";
        background-color: #e7e5e5;
        height: 3px;
        display: block;
        transition: background-color 0.25s linear, height 0.15s linear;
      }

      &.active::after {
        background-color: ${(props) => props.activeColor};
      }
    }
  }
`;

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
          <span className="text-right block w-full uppercase font-semibold text-gray-500 dark:text-white">
            {text}
          </span>
        </div>
      </PasswordStrengthIndicatorStyled>
    )
  );
};

export default PasswordStrengthIndicator;
