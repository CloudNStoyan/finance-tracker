import { Button, IconButton, styled, TextField } from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";
import Icons, { IconKey } from "../../infrastructure/Icons";
import IconComponent from "../../components/IconComponent";
import { Category } from "../../server-api";
import { useAppDispatch } from "../../state/hooks";
import { setNotification } from "../../state/notificationSlice";
import ColorComponent from "../ColorComponent";
import { Delete, West } from "@mui/icons-material";
import DesktopCategoryModalStyled from "../styles/desktop/DesktopCategoryModal.styled";
import {
  addNewOrEditCategory,
  deleteCategory,
} from "../../state/categorySlice";
import DeleteDialog from "../DeleteDialog";
import {
  COLORS,
  INITIAL_COLOR_INDEX,
} from "../../infrastructure/CategoryColors";

export type DesktopCategoryModalProps = {
  category?: Category;
  onClose: () => void;
};

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
  "& .MuiInput-underline:before": {
    borderBottomColor: "white",
  },
  "& label": {
    color: "white",
  },
});

const categoryIcons = Object.keys(Icons);

const DesktopCategoryModal: FunctionComponent<DesktopCategoryModalProps> = ({
  category,
  onClose,
}) => {
  const [color, setColor] = useState(COLORS[INITIAL_COLOR_INDEX]);
  const [colorIdx, setColorIdx] = useState(INITIAL_COLOR_INDEX);
  const [showIcons, setShowIcons] = useState(false);

  const [iconKey, setIconKey] = useState<IconKey>("money");
  const [iconIdx, setIconIdx] = useState(0);

  const [categoryName, setCategoryName] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!category) {
      return;
    }

    setCategoryName(category.name);
    setColor(category.bgColor);
    setColorIdx(COLORS.indexOf(category.bgColor));
    setIconKey(category.icon);
    setIconIdx(categoryIcons.indexOf(category.icon));
  }, [category]);

  const onColorClick = (bgColor: string, idx: number) => {
    setColor(bgColor);
    setColorIdx(idx);
  };

  const onIconClick = (key: IconKey, idx: number) => {
    setIconIdx(idx);
    setIconKey(key);
  };

  const onSubmit = async () => {
    if (categoryName.length === 0) {
      dispatch(
        setNotification({
          message: "Category name can't be empty",
          color: "error",
        })
      );
      return;
    }

    try {
      const newCategory: Category = {
        name: categoryName.trim(),
        bgColor: color,
        icon: iconKey,
      };

      if (category) {
        newCategory.categoryId = category.categoryId;
      }

      await dispatch(addNewOrEditCategory(newCategory));

      if (newCategory.categoryId) {
        dispatch(
          setNotification({
            message: "Category edited.",
            color: "success",
          })
        );
      } else {
        dispatch(
          setNotification({
            message: "Category created.",
            color: "success",
          })
        );
      }

      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const onDelete = async () => {
    if (!category) {
      return;
    }

    await dispatch(deleteCategory(category.categoryId));

    dispatch(
      setNotification({
        message: "Category deleted.",
        color: "success",
      })
    );
    onClose();
  };

  return (
    <DesktopCategoryModalStyled categoryColor={color}>
      <div className="flex items-center justify-start mx-2 mt-1">
        <IconButton onClick={() => onClose()}>
          <West />
        </IconButton>
        <h2 className="grow text-center font-medium">
          {category ? "Edit Category" : "Create Category"}
        </h2>
      </div>
      <div className="relative fields-wrapper">
        <div className="pt-5 pb-10 flex items-center fields shadow-md">
          <IconButton
            onClick={() => setShowIcons(!showIcons)}
            className="border-2 text-white border-white border-dashed mx-5"
          >
            {Icons[iconKey]}
          </IconButton>
          <CustomTextField
            label="Category name"
            variant="standard"
            color="primary"
            className="flex-1 mr-10"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onBlur={(e) => setCategoryName(e.target.value)}
          />
        </div>
      </div>
      <div className="icon-color-container m-5 flex flex-wrap gap-5 justify-center items-center">
        {showIcons
          ? categoryIcons.map((iconKey: IconKey, idx: number) => (
              <IconComponent
                onClick={onIconClick}
                iconKey={iconKey}
                idx={idx}
                key={idx}
                selected={idx === iconIdx}
              />
            ))
          : COLORS.map((color: string, idx: number) => (
              <ColorComponent
                bgColor={color}
                selected={idx === colorIdx}
                onClick={onColorClick}
                key={idx}
                idx={idx}
              />
            ))}
      </div>
      <div className="p-2 w-full flex">
        {category && (
          <IconButton onClick={() => handleDelete()} className="text-red-500">
            <Delete />
          </IconButton>
        )}
        <Button
          onClick={() => void onSubmit()}
          className="block ml-auto"
          variant="contained"
        >
          {category ? "Save" : "Create"}
        </Button>
      </div>
      <DeleteDialog
        type="category"
        open={deleteDialogOpen}
        onClose={(option) => {
          setDeleteDialogOpen(false);

          if (option !== true) {
            return;
          }

          void onDelete();
        }}
      />
    </DesktopCategoryModalStyled>
  );
};

export default DesktopCategoryModal;
