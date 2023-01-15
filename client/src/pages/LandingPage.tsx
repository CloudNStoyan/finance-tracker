import { Link } from "react-router-dom";
import LandingPageStyled from "./styles/LandingPage.styled";

const LandingPage = () => {
  return (
    <LandingPageStyled>
      <h1>Finance Tracker</h1>
      <h2>Managing money, made simple</h2>
      <p>
        Calendar based personal finance management designed for real life.
        <br />
        Add past, future or recurring transactions and categorize them. Track
        them on mobile and plan ahead on the web, or just mix things up.
      </p>
      <p>
        See where your money goes and how your balance evolves over time
        <br />
        Be smarter about money. With your balance calculated automatically for
        each day, month or year, understanding your current and projected
        financial situation is so easy you might even call it fun.
      </p>
      <section>
        <h2>What our users say about us</h2>
      </section>
      <section>
        <h1>Start your journey towards personal financial freedom.</h1>
        <Link to={"/register"}>Sign up now</Link>
      </section>
    </LandingPageStyled>
  );
};

export default LandingPage;
