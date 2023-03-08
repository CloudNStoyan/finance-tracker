import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";

export interface HorizontalSelectProps {
  className?: string;
  values: string[];
  onSelect?: (value: string) => void;
}

const HorizontalSelect: FunctionComponent<HorizontalSelectProps> = ({
  className,
  values,
  onSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
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
      <div className="mx-2 display text-center">{values[selectedIndex]}</div>
      <IconButton onClick={next}>
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default HorizontalSelect;
