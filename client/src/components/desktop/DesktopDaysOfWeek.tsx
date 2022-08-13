import React from "react";
import DesktopDaysOfWeekStyled from "../styles/desktop/DesktopDaysOfWeek.styled";

const DesktopDaysOfWeek = () => {
  return (
    <DesktopDaysOfWeekStyled className="days-of-week">
      {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map(
        (day, idx) => (
          <div
            className="day-of-week ml-2 text-gray-800 dark:text-white"
            key={idx}
          >
            {day}
          </div>
        )
      )}
      {["SATURDAY", "SUNDAY"].map((day, idx) => (
        <div
          className="day-of-week ml-2 text-gray-500 dark:text-white"
          key={idx}
        >
          {day}
        </div>
      ))}
    </DesktopDaysOfWeekStyled>
  );
};

export default DesktopDaysOfWeek;
