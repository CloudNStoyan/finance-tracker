import React, { useEffect, useState } from "react";
import ChevronRight from "@mui/icons-material/ChevronRight";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import { IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fromUnixTimeMs } from "../infrastructure/CustomDateUtils";
import { addMonths, format, getTime, subMonths } from "date-fns";
import { setNow } from "../state/calendarSlice";

const CalendarNavigation = () => {
  const dispatch = useAppDispatch();
  const now = useAppSelector((state) => state.calendarReducer.now);

  const [nowParsed, setNowParsed] = useState(fromUnixTimeMs(now) ?? new Date());

  useEffect(() => {
    if (now === null) {
      return;
    }

    setNowParsed(fromUnixTimeMs(now));
  }, [now]);

  return (
    <div className="flex justify-center items-center">
      <IconButton
        onClick={() => dispatch(setNow(getTime(subMonths(nowParsed, 1))))}
      >
        <ChevronLeft />
      </IconButton>
      {nowParsed && <span>{format(nowParsed, "MMMM yyyy")}</span>}
      <IconButton
        onClick={() => dispatch(setNow(getTime(addMonths(nowParsed, 1))))}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default CalendarNavigation;
