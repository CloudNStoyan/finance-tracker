import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "../server-api";

export type CategoriesState = {
  categories: Category[];
  categoriesAreFetched: boolean;
};

const initialState: CategoriesState = {
  categories: [],
  categoriesAreFetched: false,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
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
    categoriesWereFetched(state) {
      state.categoriesAreFetched = true;
    },
  },
});

export const {
  setCategories,
  editCategory,
  addCategory,
  removeCategory,
  categoriesWereFetched,
} = categoriesSlice.actions;
export default categoriesSlice.reducer;
