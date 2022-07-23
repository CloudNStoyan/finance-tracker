import React from "react";
import MyButton from "./components/MyButton";
import MyHeading from "./components/MyHeading";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button/Button";

const App = () => {
  return (
    <div>
      <Link to="/invoices">Invoices</Link>
      <Link to="/expenses">Expenses</Link>
      <MyHeading text="Is it rendered?" />
      <MyButton />
      <Button variant="contained">Good</Button>
      <h4 className="bg-red-400">Hello from the other side</h4>
    </div>
  );
};

export default App;
