import NotListedLocationIcon from "@mui/icons-material/NotListedLocation";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "../infrastructure/ThemeManager";

const NotFoundPageStyled = styled.div`
  .icon {
    font-size: 100px;
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <NotFoundPageStyled className="flex flex-col justify-center items-center w-full h-full">
      <NotListedLocationIcon className="icon" />
      <h1>Nothing found on this page.</h1>
      <Button onClick={() => navigate("/")}>Return to Calendar</Button>
    </NotFoundPageStyled>
  );
};

export default NotFoundPage;
