import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface MainState {
  isLoading: boolean;
}

const initialState: MainState = {
  isLoading: false,
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsLoading } = mainSlice.actions;
export default mainSlice.reducer;
