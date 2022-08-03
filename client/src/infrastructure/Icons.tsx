import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import DirectionsCarFilledOutlinedIcon from "@mui/icons-material/DirectionsCarFilledOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocalHospitalIcon from "@mui/icons-material/LocalHospitalOutlined";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenterOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import React from "react";

const Icons = {
  money: <AttachMoneyOutlinedIcon />,
  car: <DirectionsCarFilledOutlinedIcon />,
  food: <RestaurantOutlinedIcon />,
  creditCard: <CreditCardOutlinedIcon />,
  health: <LocalHospitalIcon />,
  dumbbell: <FitnessCenterIcon />,
  shopping: <ShoppingBagOutlinedIcon />,
  bus: <DirectionsBusOutlinedIcon />,
};

export type IconKey = keyof typeof Icons;

export default Icons;
