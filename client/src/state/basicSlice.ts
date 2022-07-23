import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BasicState {
  counter: number;
}

const initialState: BasicState = {
  counter: 1,
};

const basicSlice = createSlice({
  name: "basic",
  initialState,
  reducers: {
    setCounter(state, action: PayloadAction<number>) {
      state.counter = action.payload;
    },
  },
});

export const { setCounter } = basicSlice.actions;
export default basicSlice.reducer;
