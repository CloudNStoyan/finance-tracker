import { Button, IconButton, styled, TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import Icons, { IconKey } from "../../infrastructure/Icons";
import IconComponent from "../../components/IconComponent";
import { Category } from "../../server-api";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setNotification } from "../../state/notificationSlice";
import ColorComponent from "../ColorComponent";
import { Delete, West } from "@mui/icons-material";
import DesktopCategoryModalStyled from "../styles/desktop/DesktopCategoryModal.styled";
import {
  addNewOrEditCategory,
  deleteCategory,
  resetAddOrEditStatus,
} from "../../state/categorySlice";
import DeleteDialog from "../DeleteDialog";
import {
  COLORS,
  INITIAL_COLOR_INDEX,
} from "../../infrastructure/CategoryColors";
import LoadingCircleAnimation from "../LoadingCircleAnimation";

export interface DesktopCategoryModalProps {
  category?: Category;
  onClose: () => void;
}

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(null);

  const { addOrEditStatus } = useAppSelector(
    (state) => state.categoriesReducer
  );

  const [categoryNameError, setCategoryNameError] = useState(false);

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

  useEffect(() => {
    switch (addOrEditStatus) {
      case "succeeded":
        if (category?.categoryId) {
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
        dispatch(resetAddOrEditStatus());
        return;
      case "failed":
        dispatch(
          setNotification({
            message: "General error!",
            color: "error",
          })
        );
        setError("General error! Please try again later.");
        dispatch(resetAddOrEditStatus());
        return;
      case "idle":
        return;
      case "loading":
        return;
    }
  }, [addOrEditStatus, onClose, dispatch, category]);

  useEffect(() => {
    if (categoryName.length === 0) {
      return;
    }

    setCategoryNameError(false);
  }, [categoryName]);

  const onColorClick = (bgColor: string, idx: number) => {
    setColor(bgColor);
    setColorIdx(idx);
  };

  const onIconClick = (key: IconKey, idx: number) => {
    setIconIdx(idx);
    setIconKey(key);
  };

  const onSubmit = async () => {
    setError(null);

    if (categoryName.length === 0) {
      setCategoryNameError(true);
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

      setLoading(true);

      await dispatch(addNewOrEditCategory(newCategory));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
    <DesktopCategoryModalStyled categoryColor={color} isLoading={loading}>
      {loading && <LoadingCircleAnimation className="loading-wrapper" />}
      <div className="flex items-center justify-start mx-2 mt-1">
        <IconButton disabled={loading} onClick={() => onClose()}>
          <West />
        </IconButton>
        <h2 className="grow text-center font-medium">
          {category ? "Edit Category" : "Create Category"}
        </h2>
      </div>
      <div className="relative fields-wrapper">
        <div className="pt-5 pb-10 flex items-center fields shadow-md">
          <IconButton
            disabled={loading}
            onClick={() => setShowIcons(!showIcons)}
            className="border-2 text-white border-white border-dashed mx-5"
          >
            {Icons[iconKey]}
          </IconButton>
          <CustomTextField
            disabled={loading}
            label="Category name"
            variant="standard"
            color="primary"
            className="flex-1 mr-10 category-name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            onBlur={(e) => setCategoryName(e.target.value)}
            autoComplete="off"
            id="CategoryName"
            helperText={categoryNameError ? "Category name is required" : null}
          />
        </div>
      </div>
      <div className="icon-color-container m-5 flex flex-wrap gap-5 justify-center items-center">
        {showIcons
          ? categoryIcons.map((iconKey: IconKey, idx: number) => (
              <IconComponent
                disabled={loading}
                onClick={onIconClick}
                iconKey={iconKey}
                idx={idx}
                key={idx}
                selected={idx === iconIdx}
              />
            ))
          : COLORS.map((color: string, idx: number) => (
              <ColorComponent
                disabled={loading}
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
          <IconButton
            disabled={loading}
            onClick={() => handleDelete()}
            className="text-red-500"
          >
            <Delete />
          </IconButton>
        )}
        <Button
          disabled={loading}
          onClick={() => void onSubmit()}
          className="block ml-auto"
          variant="contained"
        >
          {category ? "Save" : "Create"}
        </Button>
      </div>
      {error && (
        <div className="text-red-500 font-medium p-4 text-center">{error}</div>
      )}
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
