import { IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect } from "react";
import CategoryInlineComponent from "../components/CategoryInlineComponent";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { fetchCategories } from "../state/categorySlice";
import { styled } from "../infrastructure/ThemeManager";

const ManageCategoriesPageStyled = styled.div`
  max-height: calc(100vh - 50px);
  overflow: hidden;

  .categories-container {
    overflow-y: scroll;
  }
`;

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
      {categories.length > 0 && (
        <div className="categories-container grow">
          {categories.map((cat) => (
            <CategoryInlineComponent category={cat} key={cat.categoryId} />
          ))}
        </div>
      )}
      {categoriesStatus === "succeeded" && categories.length === 0 && (
        <div className="mt-3 font-semibold text-center">
          <h2>You don&#39;t have any categories yet.</h2>
          <h2>Try adding one!</h2>
        </div>
      )}
    </ManageCategoriesPageStyled>
  );
};

export default ManageCategoriesPage;
