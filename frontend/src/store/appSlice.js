import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarShow: true,
  theme: "light",
  sidebarUnfoldable: true,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSidebarShow(state, action) {
      state.sidebarShow = action.payload;
    },
    setSidebarUnfoldable(state, action) {
        state.sidebarUnfoldable = action.payload;
    },
  },
});

export const { setSidebarShow, setSidebarUnfoldable } = appSlice.actions;
export default appSlice.reducer;
