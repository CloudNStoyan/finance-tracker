import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../state/hooks";
import DesktopLandingPageStyled from "../styles/desktop/DesktopLandingPage.styled";
import CalendarPhoneLight from "../../assets/calendar-phone-light.png";
import CalendarPhoneDark from "../../assets/calendar-phone-dark.png";
import CalendarDesktopLight from "../../assets/calendar-desktop-light.png";
import CalendarDesktopDark from "../../assets/calendar-desktop-dark.png";
import StatsPhoneLight from "../../assets/stats-phone-light.png";
import StatsPhoneDark from "../../assets/stats-phone-dark.png";
import StatsDesktopLight from "../../assets/stats-desktop-light.png";
import StatsDesktopDark from "../../assets/stats-desktop-dark.png";
import TestimonialCarousel from "../../components/TestimonialCarousel";

const DesktopLandingPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppSelector((state) => state.themeReducer);

  return (
    <DesktopLandingPageStyled
      isDarkMode={isDarkMode}
      className="dark:text-white"
    >
      <div className="navbar shadow-md top-0 fixed w-full z-10">
        <div className="container flex justify-between items-center p-2">
          <Link to={"/"}>
            <h1 className="mx-8">Finance Tracker</h1>
          </Link>
          <div>
            <Button onClick={() => navigate("/login")} className="mr-2">
              Log in
            </Button>
            <Button onClick={() => navigate("/register")} variant="contained">
              Register
            </Button>
          </div>
        </div>
      </div>
      <main>
        <h2>Managing money, made simple</h2>
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
        <div className="flex justify-between">
          <img
            className="desktop-device"
            src={isDarkMode ? CalendarDesktopDark : CalendarDesktopLight}
            alt={`Calendar on desktop in ${
              isDarkMode ? "dark" : "light"
            } mode mockup`}
          />
          <img
            className="mobile-device mr-12"
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
        <div className="flex justify-between">
          <img
            className="mobile-device ml-12"
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
        <section>
          <h2>What our users say about us</h2>
          <TestimonialCarousel className="flex gap-2 mt-10" />
        </section>
        <section className="flex items-center justify-center flex-col gap-10 mt-10 mb-10">
          <h1>Start your journey towards personal financial freedom.</h1>
          <Button
            size="large"
            onClick={() => navigate("/register")}
            variant="contained"
          >
            Register
          </Button>
        </section>
      </main>
    </DesktopLandingPageStyled>
  );
};

export default DesktopLandingPage;
