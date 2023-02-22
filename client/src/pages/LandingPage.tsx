import { Button, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../state/hooks";
import CalendarPhoneLight from "../assets/calendar-phone-light.png";
import CalendarPhoneDark from "../assets/calendar-phone-dark.png";
import CalendarDesktopLight from "../assets/calendar-desktop-light.png";
import CalendarDesktopDark from "../assets/calendar-desktop-dark.png";
import StatsPhoneLight from "../assets/stats-phone-light.png";
import StatsPhoneDark from "../assets/stats-phone-dark.png";
import StatsDesktopLight from "../assets/stats-desktop-light.png";
import StatsDesktopDark from "../assets/stats-desktop-dark.png";
import TestimonialCarousel from "../components/TestimonialCarousel";
import LandingPageStyled from "./styles/LandingPage.styled";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <LandingPageStyled isDarkMode={isDarkMode} className="dark:text-white">
      <div className="navbar shadow-md top-0 fixed w-full z-10">
        <div className="container flex justify-between items-center p-2">
          <Link to={"/"}>
            <h1 className="ml-2">Finance Tracker</h1>
          </Link>
          <IconButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </div>
      {isMenuOpen && (
        <div className="navbar-menu flex flex-col items-center justify-center">
          <Button
            className="dark:text-white"
            size="large"
            onClick={() => navigate("/login")}
          >
            Log in
          </Button>
          <Button
            className="dark:text-white"
            size="large"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </div>
      )}
      <main>
        <h2 className="mb-2">Managing money, made simple</h2>
        <h3>
          Calendar based personal finance management designed for{" "}
          <span className="underline decoration-2 decoration-blue-500 dark:decoration-purple-500">
            real life.
          </span>
        </h3>
        <p>
          Add past, future or recurring transactions and categorize them. Track
          them on mobile and plan ahead on the web, or just mix things up.
        </p>
        <div className="flex flex-col items-center gap-8 my-4">
          <img
            className="desktop-device"
            src={isDarkMode ? CalendarDesktopDark : CalendarDesktopLight}
            alt={`Calendar on desktop in ${
              isDarkMode ? "dark" : "light"
            } mode mockup`}
          />
          <img
            className="mobile-device"
            src={isDarkMode ? CalendarPhoneDark : CalendarPhoneLight}
            alt={`Calendar on phone in ${
              isDarkMode ? "dark" : "light"
            } mode mockup`}
          />
        </div>
        <h3>
          See where your money goes and how your{" "}
          <span className="underline decoration-2 decoration-blue-500 dark:decoration-purple-500">
            balance
          </span>{" "}
          evolves over time
        </h3>
        <p>
          Be smarter about money. With your balance calculated automatically for
          each day, month or year, understanding your current and projected
          financial situation is so easy you might even call it fun.
        </p>
        <div className="flex flex-col items-center gap-8 my-4">
          <img
            className="mobile-device"
            src={isDarkMode ? StatsPhoneDark : StatsPhoneLight}
            alt={`Stats on phone in ${
              isDarkMode ? "dark" : "light"
            } mode mockup`}
          />
          <img
            className="desktop-device"
            src={isDarkMode ? StatsDesktopDark : StatsDesktopLight}
            alt={`Stats on desktop in ${
              isDarkMode ? "dark" : "light"
            } mode mockup`}
          />
        </div>
        <section className="mt-14">
          <h2>What our users say about us</h2>
          <TestimonialCarousel className="flex gap-2 mt-10" />
        </section>
        <section className="flex items-center justify-center flex-col gap-10 mt-10 mb-10 px-5">
          <h1>Start your journey towards personal financial freedom.</h1>
          <Button
            className="w-full"
            size="large"
            onClick={() => navigate("/register")}
            variant="contained"
          >
            Register
          </Button>
        </section>
      </main>
    </LandingPageStyled>
  );
};

export default LandingPage;
