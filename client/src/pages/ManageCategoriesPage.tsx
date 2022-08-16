import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useEffect } from "react";
import CategoryInlineComponent from "../components/CategoryInlineComponent";
import { getCategories } from "../server-api";
import { useNavigate } from "react-router-dom";
import ManageCategoriesPageStyled from "./styles/ManageCategoriesPage.styled";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { categoriesWereFetched, setCategories } from "../state/categorySlice";

const ManageCategoriesPage = () => {
  const dispatch = useAppDispatch();
  const { categories, categoriesAreFetched } = useAppSelector(
    (state) => state.categoriesReducer
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (categoriesAreFetched) {
      return;
    }

    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        dispatch(setCategories(resp.data));
        dispatch(categoriesWereFetched());
      } catch (err) {
        if (!axios.isAxiosError(err)) {
          return;
        }
      }
    };

    void fetchApi();
  }, [dispatch, categoriesAreFetched]);

  return (
    <ManageCategoriesPageStyled className="flex flex-col">
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
      <div className="categories-container">
        {categories.map((cat) => (
          <CategoryInlineComponent category={cat} key={cat.categoryId} />
        ))}
      </div>
    </ManageCategoriesPageStyled>
  );
};

export default ManageCategoriesPage;
