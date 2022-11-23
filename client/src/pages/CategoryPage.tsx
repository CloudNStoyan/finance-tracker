import { IconButton, styled, TextField } from "@mui/material";
import { FunctionComponent, useEffect, useState } from "react";
import CategoryPageStyled from "./styles/CategoryPage.styled";
import ColorComponent from "../components/ColorComponent";
import CheckIcon from "@mui/icons-material/Check";
import Icons, { IconKey } from "../infrastructure/Icons";
import IconComponent from "../components/IconComponent";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category } from "../server-api";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setNotification } from "../state/notificationSlice";
import {
  addNewOrEditCategory,
  fetchCategories,
  deleteCategory,
} from "../state/categorySlice";
import DeleteDialog from "../components/DeleteDialog";
import { COLORS, INITIAL_COLOR_INDEX } from "../infrastructure/CategoryColors";

export type UseParamsCategoryType = { categoryId: number };

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
    borderBottom: "2px solid white",
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
});

const categoryIcons = Object.keys(Icons);

const CategoryPage: FunctionComponent<{ hasCategoryId: boolean }> = ({
  hasCategoryId,
}) => {
  const [color, setColor] = useState(COLORS[INITIAL_COLOR_INDEX]);
  const [colorIdx, setColorIdx] = useState(INITIAL_COLOR_INDEX);
  const [showIcons, setShowIcons] = useState(false);

  const [iconKey, setIconKey] = useState<IconKey>("money");
  const [iconIdx, setIconIdx] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

  const [categoryName, setCategoryName] = useState("");

  const { categoryId } = useParams();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const categoriesStatus = useAppSelector(
    (state) => state.categoriesReducer.status
  );

  useEffect(() => {
    if (categoriesStatus === "idle") {
      void dispatch(fetchCategories());
    }
  }, [categoriesStatus, dispatch]);

  useEffect(() => {
    if (!hasCategoryId || categoriesStatus !== "succeeded") {
      return;
    }

    const category = categories.find(
      (c) => c.categoryId === Number(categoryId)
    );

    if (!category) {
      return;
    }

    setCategoryName(category.name);
    setColor(category.bgColor);
    setColorIdx(COLORS.indexOf(category.bgColor));
    setIconKey(category.icon);
    setIconIdx(categoryIcons.indexOf(category.icon));
  }, [hasCategoryId, categories, categoryId, categoriesStatus]);

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
      const category: Category = {
        name: categoryName.trim(),
        bgColor: color,
        icon: iconKey,
      };

      if (hasCategoryId) {
        category.categoryId = Number(categoryId);
      }

      await dispatch(addNewOrEditCategory(category));

      if (hasCategoryId) {
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

      navigate("/categories");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const onDelete = async () => {
    if (!hasCategoryId) {
      return;
    }

    await dispatch(deleteCategory(Number(categoryId)));

    dispatch(
      setNotification({
        message: "Category deleted.",
        color: "success",
      })
    );
    navigate("/categories");
  };

  return (
    <CategoryPageStyled categoryColor={color}>
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
        <IconButton
          onClick={() => void onSubmit()}
          size="large"
          className="dark:bg-purple-500 text-white bg-blue-500 save-btn focus:scale-110"
        >
          <CheckIcon />
        </IconButton>
        {hasCategoryId && (
          <IconButton
            onClick={() => handleDelete()}
            size="small"
            className="bg-red-500 text-gray-100 border-2 border-gray-400 delete-btn focus:scale-110"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </div>
      {showIcons ? (
        <div className="m-5 flex flex-wrap gap-5 justify-center items-center">
          {categoryIcons.map((iconKey: IconKey, idx: number) => (
            <IconComponent
              onClick={onIconClick}
              iconKey={iconKey}
              idx={idx}
              key={idx}
              selected={idx === iconIdx}
            />
          ))}
        </div>
      ) : (
        <div className="m-5 flex flex-wrap gap-5 justify-center items-center">
          {COLORS.map((color: string, idx: number) => (
            <ColorComponent
              bgColor={color}
              selected={idx === colorIdx}
              onClick={onColorClick}
              key={idx}
              idx={idx}
            />
          ))}
        </div>
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
    </CategoryPageStyled>
  );
};

export default CategoryPage;
