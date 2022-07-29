import styled from "styled-components";

import bottomWaves from "../../assets/bottom-waves.svg";
import bottomWavesFlipped from "../../assets/bottom-waves-v-flipped.svg";

const RegisterPageStyled = styled.div`
  min-height: 100vh;
  background: url(${bottomWavesFlipped});
  background-repeat: no-repeat;
  background-size: cover;

  display: flex;
  justify-content: center;
  align-items: center;

  .icon {
    color: #4facf7;
  }

  .wrapper {
    display: flex;
    justify-content: center;
    align-items: center;

    background: url(${bottomWaves});
    background-repeat: no-repeat;
    background-size: cover;
  }

  .loading-circle {
    position: absolute;
    z-index: 1;
  }
`;

export default RegisterPageStyled;
