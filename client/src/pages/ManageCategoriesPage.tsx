import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useEffect } from "react";
import CategoryInlineComponent from "../components/CategoryInlineComponent";
import { useNavigate } from "react-router-dom";
import ManageCategoriesPageStyled from "./styles/ManageCategoriesPage.styled";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fetchCategories } from "../state/categorySlice";

const ManageCategoriesPage = () => {
  const categories = useAppSelector(
    (state) => state.categoriesReducer.categories
  );

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

  return (
    <ManageCategoriesPageStyled className="flex flex-col h-full">
      <div className="flex justify-between items-center shadow-md">
        <h1 className="grow text-center ml-3 font-bold text-gray-500 dark:text-gray-300">
          Manage Categories
        </h1>
        <IconButton
          onClick={() => navigate("/category")}
          className="bg-green-600 shadow-lg text-white dark:text-gray-300 m-2 rounded-full"
        >
          <AddIcon />
        </IconButton>
      </div>
      <div className="categories-container grow">
        {categories.map((cat) => (
          <CategoryInlineComponent category={cat} key={cat.categoryId} />
        ))}
      </div>
    </ManageCategoriesPageStyled>
  );
};

export default ManageCategoriesPage;
