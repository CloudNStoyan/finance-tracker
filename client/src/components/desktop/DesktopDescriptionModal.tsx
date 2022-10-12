import { West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import React, { FunctionComponent, useState } from "react";
import DesktopDescriptionModalStyled from "../styles/desktop/DesktopDescriptionModal.styled";

export type DesktopDescriptionModalProps = {
  onClose: () => void;
  onDone: (descrp: string) => void;
  description: string;
};

const DesktopDescriptionModal: FunctionComponent<
  DesktopDescriptionModalProps
> = ({ description, onClose, onDone }) => {
  const [descrp, setDescrp] = useState(description);

  return (
    <DesktopDescriptionModalStyled>
      <div className="flex items-center justify-start mx-2 mt-1">
        <IconButton onClick={() => onClose()}>
          <West />
        </IconButton>
        <h2 className="grow text-center font-medium">
          {description.trim().length === 0
            ? "Add description"
            : "Edit description"}
        </h2>
      </div>
      <textarea
        onChange={(e) => setDescrp(e.target.value)}
        onBlur={(e) => setDescrp(e.target.value)}
        value={descrp}
      ></textarea>
      <div className="m-3">
        <Button
          onClick={() => onDone(descrp)}
          className="block ml-auto"
          variant="contained"
        >
          Done
        </Button>
      </div>
    </DesktopDescriptionModalStyled>
  );
};

export default DesktopDescriptionModal;
