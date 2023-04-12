import { FunctionComponent, useEffect, useState } from "react";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { Button, IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import { addMonths, format, getTime, subMonths } from "date-fns";
import { setNow } from "../state/calendarSlice";

const today = new Date();

const CalendarNavigation: FunctionComponent<{
  buttonTailwindColor?: string;
}> = ({ buttonTailwindColor }) => {
  const dispatch = useAppDispatch();
  const now = useAppSelector((state) => state.calendarReducer.now);

  const [nowParsed, setNowParsed] = useState(fromUnixTimeMs(now) ?? new Date());

  const onPreviousClicked = () => {
    dispatch(setNow(getTime(subMonths(nowParsed, 1))));
  };

  const onNextClicked = () => {
    dispatch(setNow(getTime(addMonths(nowParsed, 1))));
  };

  const onTodayClicked = () => {
    dispatch(setNow(getTime(today)));
  };

  useEffect(() => {
    if (now === null) {
      return;
    }

    setNowParsed(fromUnixTimeMs(now));
  }, [now]);

  return (
    <div className="flex justify-center calendar-nav">
      <div className="flex justify-center items-center">
        <IconButton onClick={onPreviousClicked} className={buttonTailwindColor}>
          <ChevronLeft />
        </IconButton>
        {nowParsed && (
          <span className="w-32 text-center">
            {format(nowParsed, "MMMM yyyy")}
          </span>
        )}
        <IconButton onClick={onNextClicked} className={buttonTailwindColor}>
          <ChevronRight />
        </IconButton>
      </div>
      <Button
        variant="text"
        color="inherit"
        className="today-btn"
        onClick={onTodayClicked}
      >
        Today
      </Button>
    </div>
  );
};

export default CalendarNavigation;
