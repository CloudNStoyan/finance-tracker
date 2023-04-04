import { West } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { FunctionComponent, useState } from "react";
import DesktopDescriptionModalStyled from "./DesktopDescriptionModal.styled";
import { setTransactionDescription } from "../../state/addOrEditTransactionSlice";
import { useAppDispatch } from "../../state/hooks";

export interface DesktopDescriptionModalProps {
  onClose: () => void;
  description: string;
}

const DesktopDescriptionModal: FunctionComponent<
  DesktopDescriptionModalProps
> = ({ description, onClose }) => {
  const [descrp, setDescrp] = useState(description);
  const dispatch = useAppDispatch();

  const onDone = () => {
    dispatch(setTransactionDescription(descrp));

    onClose();
  };

  return (
    <DesktopDescriptionModalStyled>
      <div className="flex items-center justify-start mx-2 mt-1">
        <IconButton onClick={onClose}>
          <West />
        </IconButton>
        <h2 className="grow text-center font-medium">
          {description?.trim().length === 0
            ? "Add description"
            : "Edit description"}
        </h2>
      </div>
      <textarea
        onChange={(e) => setDescrp(e.target.value)}
        onBlur={(e) => setDescrp(e.target.value)}
        value={descrp ?? ""}
      ></textarea>
      <div className="m-3">
        <Button onClick={onDone} className="block ml-auto" variant="contained">
          Done
        </Button>
      </div>
    </DesktopDescriptionModalStyled>
  );
};

export default DesktopDescriptionModal;
