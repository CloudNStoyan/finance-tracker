import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "../../infrastructure/ThemeManager";

const DesktopNotFoundPageStyled = styled.div`
  .icon {
    font-size: 100px;
  }
`;

const DesktopNotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <DesktopNotFoundPageStyled className="flex flex-col justify-center items-center w-full h-full">
      <NotListedLocationIcon className="icon" />
      <h1>Nothing found on this page.</h1>
      <Button size="large" onClick={() => navigate("/")}>
        Return to Calendar
      </Button>
    </DesktopNotFoundPageStyled>
  );
};

export default DesktopNotFoundPage;
