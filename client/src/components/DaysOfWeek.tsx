import React from "react";
import { useAppSelector } from "../state/hooks";

const DaysOfWeek = () => {
  const firstDayOfTheMonth = useAppSelector(
    (state) => state.calendarReducer.firstDayOfTheMonth
  );

  return (
    <>
      {firstDayOfTheMonth === "monday" && (
        <>
          {["MON", "TUE", "WED", "THU", "FRI"].map((day, idx) => (
            <div
              className="text-center text-gray-800 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
          {["SAT", "SUN"].map((day, idx) => (
            <div
              className="text-center text-gray-500 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
        </>
      )}
      {firstDayOfTheMonth === "sunday" && (
        <>
          {["SUN", "MON", "TUE", "WED", "THU"].map((day, idx) => (
            <div
              className="text-center text-gray-800 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
          {["FRI", "SAT"].map((day, idx) => (
            <div
              className="text-center text-gray-500 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
        </>
      )}
    </>
  );
};

export default DaysOfWeek;
