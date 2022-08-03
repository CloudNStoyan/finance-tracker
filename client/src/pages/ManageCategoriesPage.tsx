import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import React, { useEffect, useState } from "react";
import CategoryInlineComponent from "../components/CategoryInlineComponent";
import { Category, getCategories } from "../server-api";
import { useNavigate } from "react-router-dom";
import ManageCategoriesPageStyled from "./styles/ManageCategoriesPage.styled";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchApi = async () => {
      try {
        const resp = await getCategories();

        if (resp.status !== 200) {
          return;
        }

        setCategories(resp.data);
      } catch (error) {
        if (!axios.isAxiosError(error)) {
          return;
        }
      }
    };

    void fetchApi();
  }, []);
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
