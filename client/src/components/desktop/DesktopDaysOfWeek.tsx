import { useAppSelector } from "../../state/hooks";
import DesktopDaysOfWeekStyled from "../styles/desktop/DesktopDaysOfWeek.styled";

const DesktopDaysOfWeek = () => {
  const firstDayOfTheMonth = useAppSelector(
    (state) => state.calendarReducer.firstDayOfTheMonth
  );

  return (
    <DesktopDaysOfWeekStyled className="days-of-week">
      {firstDayOfTheMonth === "monday" && (
        <>
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
        </>
      )}
      {firstDayOfTheMonth === "sunday" && (
        <>
          {["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"].map(
            (day, idx) => (
              <div
                className="day-of-week ml-2 text-gray-800 dark:text-white"
                key={idx}
              >
                {day}
              </div>
            )
          )}
          {["FRIDAY", "SATURDAY"].map((day, idx) => (
            <div
              className="day-of-week ml-2 text-gray-500 dark:text-white"
              key={idx}
            >
              {day}
            </div>
          ))}
        </>
      )}
    </DesktopDaysOfWeekStyled>
  );
};

export default DesktopDaysOfWeek;
