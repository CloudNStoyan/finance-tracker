import { useState, useEffect, useRef } from "react";
import { IconButton, InputAdornment, styled, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CalendarNavigation from "../../components/CalendarNavigation";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setSearchValue } from "../../state/calendarSlice";

const CustomTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& label.Mui-focused ": {
    color: "white",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "white",
  },
  "& .Mui-focused:after": {
    borderBottom: "3px solid white",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "white",
  },
  "& .MuiInput-underline:hover:before": {
    borderBottomColor: "white!important",
  },
  "& label": {
    color: "white",
  },
  "& .MuiInput-underline.Mui-disabled:after": {
    borderBottomStyle: "solid",
  },
  "& .MuiInput-underline.Mui-disabled:before": {
    borderBottomStyle: "solid",
  },
  "& label.Mui-disabled": {
    color: "white",
  },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "white",
  },
});

const DesktopCalendarSearch = () => {
  const dispatch = useAppDispatch();
  const { searchValue } = useAppSelector((state) => state.calendarReducer);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>();

  useEffect(() => {
    if (!showSearchInput) {
      return;
    }

    searchInputRef.current.querySelector("input").focus();
  }, [showSearchInput, searchValue]);

  return (
    <div className="flex justify-end mt-2 mr-1">
      {showSearchInput && (
        <CustomTextField
          placeholder="e.g. car or 19.99"
          value={searchValue}
          ref={searchInputRef}
          variant="standard"
          autoComplete="off"
          id="Search"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => dispatch(setSearchValue(""))}
                  className={`text-white ${
                    !searchValue || searchValue.trim().length === 0
                      ? "invisible"
                      : ""
                  }`}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            void dispatch(setSearchValue(e.target.value));
          }}
          onBlur={(e) => {
            void dispatch(setSearchValue(e.target.value));

            if (e.target.value.trim().length > 0) {
              return;
            }

            setShowSearchInput(false);
          }}
        />
      )}
      <IconButton
        onClick={() => setShowSearchInput(true)}
        className="text-white"
      >
        <SearchIcon />
      </IconButton>
      <CalendarNavigation buttonTailwindColor="text-white" />
    </div>
  );
};

export default DesktopCalendarSearch;
