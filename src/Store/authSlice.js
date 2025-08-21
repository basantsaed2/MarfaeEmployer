// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employer: JSON.parse(localStorage.getItem("employer")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmployer: (state, action) => {
      state.employer = action.payload;
    },
    logout: (state) => {
      state.employer = null;
      localStorage.removeItem("employer");
    },
  },
});

export const { setEmployer, logout } = authSlice.actions;
export default authSlice.reducer;
