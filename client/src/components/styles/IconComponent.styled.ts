import { styled } from "../../infrastructure/ThemeManager";

const IconComponentStyled = styled.div<{ selected: boolean }>`
  button {
    border: 2px solid ${({ theme }) => theme.colors.text};
    animation: custom-scale-0-1 0.25s;

    ${({ selected, theme }) =>
      selected
        ? `
        background-color: ${theme.colors.topbarBg}!important; 
        color: white; 
        border-color: white;
        transform: scale(1.3);
        transition: transform 0.15s linear;
        `
        : ""}
  }
`;

export default IconComponentStyled;
