import React from "react";

const DaysOfWeek = () => {
  return (
    <>
      {["MON", "TUE", "WED", "THU", "FRI"].map((day, idx) => (
        <div className="text-center text-gray-800 dark:text-white" key={idx}>
          {day}
        </div>
      ))}
      {["SAT", "SUN"].map((day, idx) => (
        <div className="text-center text-gray-500 dark:text-white" key={idx}>
          {day}
        </div>
      ))}
    </>
  );
};

export default DaysOfWeek;
