import styled from "@emotion/styled";

const LoadingCircleAnimationStyled = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .loading-circle {
    position: absolute;
    z-index: 1;
  }
`;

export default LoadingCircleAnimationStyled;
