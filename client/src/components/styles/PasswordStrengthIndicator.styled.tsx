import styled from "styled-components";

type Props = {
  activeColor: string;
};

const PasswordStrengthIndicatorStyled = styled.div<Props>`
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

export default PasswordStrengthIndicatorStyled;
