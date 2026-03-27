/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CreateUserRequest, UserProfile } from "./userTypes";
import { userAPI } from "./userAPI";
import { extractErrorMessage } from "../../utils/extractErrorMessage";

// 1. Định nghĩa State Interface
interface UserState {
  user: UserProfile | null;     // Dùng cho chi tiết 1 user (Profile cá nhân)
  users: UserProfile[];         // Danh sách tất cả user từ GetAll
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  users: [],
  isLoading: false,
  error: null
};

// 
// ===== THUNKS =====
// 

// 🔥 GET USER PROFILE (Single)
export const getUserThunk = createAsyncThunk(
  "user/get",
  async (id: string, thunkAPI) => {
    try {
      const response = await userAPI.getProfile(id);
      return response.data.data as UserProfile;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 GET ALL USERS
export const getAllUsersThunk = createAsyncThunk(
  "user/getAll",
  async (_, thunkAPI) => {
    try {
      const response = await userAPI.getAll();
      // Giả định response.data.data trả về mảng UserProfile[]
      return response.data.data as UserProfile[];
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 UPDATE USER
export const updateUserThunk = createAsyncThunk<
  UserProfile,
  { id: string; body: FormData }
>(
  "user/update",
  async ({ id, body }, thunkAPI) => {
    try {
      const response = await userAPI.update(id, body);
      return response.data.data as UserProfile;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);

// 🔥 DELETE USER
export const deleteUserThunk = createAsyncThunk<
  string,        // trả về id user đã xóa
  string         // id truyền vào
>(
  "user/delete",
  async (id: string, thunkAPI) => {
    try {
      await userAPI.delete(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error));
    }
  }
);
// 🔥 CREATE USER THUNK
export const createUserThunk = createAsyncThunk<
  UserProfile,
  CreateUserRequest
>(
  "user/create",
  async (body, thunkAPI) => {
    try {
      const response = await userAPI.create(body);
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
      state.users = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== GET SINGLE USER =====
      .addCase(getUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Get user failed";
      })

      // ===== GET ALL USERS =====
      .addCase(getAllUsersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsersThunk.fulfilled, (state, action: PayloadAction<UserProfile[]>) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Get all users failed";
      })

      // ===== UPDATE USER =====
      .addCase(updateUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        state.user = action.payload;
        // Option: Cập nhật lại user đó trong danh sách users nếu cần
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Update user failed";
      })

      // ===== DELETE USER =====
      .addCase(deleteUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;

        // remove user khỏi danh sách
        state.users = state.users.filter(user => user.id !== action.payload);

        // nếu đang mở profile user đó thì clear
        if (state.user?.id === action.payload) {
          state.user = null;
        }
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Delete user failed";
      })

      //=====CREATE USER =====
      // Thêm vào trong extraReducers của userSlice
      .addCase(createUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action: PayloadAction<UserProfile>) => {
        state.isLoading = false;
        // Thêm user mới vào đầu mảng để hiển thị ngay trên UI
        state.users.unshift(action.payload);
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Create user failed";
      })
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;