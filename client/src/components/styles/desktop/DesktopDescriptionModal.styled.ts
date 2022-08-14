import { styled } from "../../../infrastructure/ThemeManager";

const DesktopDescriptionModalStyled = styled.div`
  min-height: 395px;
  display: flex;
  flex-flow: column wrap;

  textarea {
    background-color: ${({ theme }) => theme.colors.background};
    padding: 5px;
    flex-grow: 1;
    resize: none;

    :focus {
      outline: 0;
    }

    &::-webkit-scrollbar {
      width: 0.4em;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0);
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.scrollBar};
      border-radius: 6px;
    }
  }
`;

export default DesktopDescriptionModalStyled;
