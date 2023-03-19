import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";

export interface HorizontalSelectValue<T = string> {
  value: T;
  text?: string;
}

export interface HorizontalSelectProps {
  className?: string;
  values: HorizontalSelectValue[];
  onSelect?: (selected: HorizontalSelectValue) => void;
  defaultSelect?: HorizontalSelectValue | string;
}

const GetDefaultIndex = (
  values: HorizontalSelectValue[],
  defaultValue?: HorizontalSelectValue | string
) => {
  if (!defaultValue) {
    return 0;
  }

  const searchValue =
    typeof defaultValue === "string" ? defaultValue : defaultValue.value;

  const selectIndex = values.findIndex((x) => x.value === searchValue);

  return selectIndex !== -1 ? selectIndex : 0;
};

const HorizontalSelect: FunctionComponent<HorizontalSelectProps> = ({
  className,
  values,
  onSelect,
  defaultSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    GetDefaultIndex(values, defaultSelect)
  );
  const previous = () => {
    let newIndex = selectedIndex - 1;

    if (newIndex < 0) {
      newIndex = values.length - 1;
    }

    setSelectedIndex(newIndex);
  };
  const next = () => {
    let newIndex = selectedIndex + 1;

    if (newIndex > values.length - 1) {
      newIndex = 0;
    }

    setSelectedIndex(newIndex);
  };

  useEffect(() => {
    if (!onSelect) {
      return;
    }

    onSelect(values[selectedIndex]);
  }, [onSelect, selectedIndex, values]);

  return (
    <div className={`flex items-center ${className}`}>
      <IconButton onClick={previous}>
        <ChevronLeft />
      </IconButton>
      <div className="mx-2 display text-center">
        {values[selectedIndex]?.text ?? values[selectedIndex].value}
      </div>
      <IconButton onClick={next}>
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default HorizontalSelect;
