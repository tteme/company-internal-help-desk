import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user } = action.payload;

      state.user = user;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },

    finishInitialization(state) {
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, logout, finishInitialization } =
  authSlice.actions;

export default authSlice.reducer;
