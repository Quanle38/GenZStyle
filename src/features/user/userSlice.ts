/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { UpdateRequestBodyUser, UserProfile } from "./userTypes";
import { userAPI } from "./userAPI";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null
};

//
// ===== THUNK =====
//

// 🔥 GET USER PROFILE
export const getUserThunk = createAsyncThunk(
  "user/get",
  async (id: string, thunkAPI) => {
    try {
      const response = await userAPI.getProfile(id);
      console.log(response.data.data)
      return response.data.data as UserProfile;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 UPDATE USER
export const updateUserThunk = createAsyncThunk(
  "user/update",
  async (body: UpdateRequestBodyUser, thunkAPI) => {
    try {
      const response = await userAPI.update(body);
      console.log(response.data.data);
      return response.data.data as UserProfile;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

//
// ===== SLICE =====
//
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== GET USER =====
      .addCase(getUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getUserThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Get user failed";
        }
      })

      // ===== UPDATE USER =====
      .addCase(updateUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isLoading = false;

        if (action.payload) {
          state.error = (action.payload as { message: string }).message;
        } else {
          state.error = action.error.message || "Update user failed";
        }
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
