import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  Category,
  createOrEditCategory,
  getCategories,
  deleteCategory as deleteCategoryApi,
} from "../server-api";
import { logoutUser } from "./authSlice";

export type CategoriesState = {
  categories: Category[];
  status: "loading" | "succeeded" | "failed" | "idle";
  addOrEditStatus: "loading" | "succeeded" | "failed" | "idle";
  error: string;
};

const initialState: CategoriesState = {
  categories: [],
  status: "idle",
  addOrEditStatus: "idle",
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const httpResponse = await getCategories();
    return httpResponse.data;
  }
);

export const addNewOrEditCategory = createAsyncThunk(
  "categories/addNewOrEditCategory",
  async (category: Category) => {
    const httpResponse = await createOrEditCategory(category);

    return { category: httpResponse.data, status: httpResponse.status };
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (categoryId: number) => {
    await deleteCategoryApi(categoryId);

    return categoryId;
  }
);

const sortComparison = (a: Category, b: Category) =>
  a.name.toLowerCase() > b.name.toLowerCase()
    ? 1
    : b.name.toLowerCase() > a.name.toLowerCase()
    ? -1
    : 0;

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    editCategory(state, action: PayloadAction<Category>) {
      state.categories = state.categories.filter(
        (cat) => cat.categoryId !== action.payload.categoryId
      );
      state.categories.push(action.payload);
      state.categories.sort(sortComparison);
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categories.push(action.payload);
      state.categories.sort(sortComparison);
    },
    removeCategory(state, action: PayloadAction<Category>) {
      state.categories = state.categories.filter(
        (cat) => cat.categoryId !== action.payload.categoryId
      );
    },
    resetAddOrEditStatus(state) {
      state.addOrEditStatus = "idle";
    },
  },
  extraReducers(builder) {
    builder.addCase(logoutUser, (state) => {
      state.categories = initialState.categories;
      state.error = initialState.error;
      state.status = initialState.status;
    });
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.status = "succeeded";
          state.error = null;

          state.categories = action.payload;
          state.categories.sort(sortComparison);
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(
        addNewOrEditCategory.fulfilled,
        (
          state,
          action: PayloadAction<{ category: Category; status: number }>
        ) => {
          state.addOrEditStatus = "succeeded";
          const { category, status } = action.payload;

          if (status === 200) {
            state.categories = state.categories.filter(
              (cat) => cat.categoryId !== category.categoryId
            );
          }

          state.categories.push(category);
          state.categories.sort(sortComparison);
        }
      )
      .addCase(addNewOrEditCategory.pending, (state) => {
        state.addOrEditStatus = "loading";
      })
      .addCase(addNewOrEditCategory.rejected, (state, action) => {
        state.addOrEditStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.status = "succeeded";

          state.categories = state.categories.filter(
            (cat) => cat.categoryId !== action.payload
          );
        }
      )
      .addCase(deleteCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const {
  editCategory,
  addCategory,
  removeCategory,
  resetAddOrEditStatus,
} = categoriesSlice.actions;
export default categoriesSlice.reducer;
