import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Category, getCategories } from "../server-api";

export type CategoriesState = {
  categories: Category[];
  status: "loading" | "succeeded" | "failed" | "idle";
  error: string;
};

const initialState: CategoriesState = {
  categories: [],
  status: "idle",
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const response = await getCategories();
    return response.data;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    editCategory(state, action: PayloadAction<Category>) {
      state.categories = state.categories.filter(
        (cat) => cat.categoryId !== action.payload.categoryId
      );
      state.categories.push(action.payload);
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categories.push(action.payload);
    },
    removeCategory(state, action: PayloadAction<Category>) {
      state.categories = state.categories.filter(
        (cat) => cat.categoryId !== action.payload.categoryId
      );
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.status = "succeeded";

          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { editCategory, addCategory, removeCategory } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
