import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import type { AuthData, LoginRequest, UserData } from "./authTypes"
import { authAPI } from "./authAPI"
import type { AxiosError } from "axios"

interface AuthState {
    user: UserData | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null
};

// ✅ Fix: Properly handle Axios errors and return serializable data
const loginThunk = createAsyncThunk(
    "auth/login",
    async (body: LoginRequest, thunkAPI) => {
        try {
            const response = await authAPI.login(body);
            console.log("response data", response.data.data)
            return response.data.data as AuthData;
        } catch (error) {
            // ✅ Extract only serializable error information
            const axiosError = error as AxiosError<{
                message?: string;
                error?: string;
            }>;
            
            const errorMessage = 
                axiosError.response?.data?.message || 
                axiosError.response?.data?.error ||
                axiosError.message || 
                "Login failed";
            
            return thunkAPI.rejectWithValue({
                message: errorMessage,
                status: axiosError.response?.status,
            });
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                // ✅ Now payload is serializable
                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Login failed";
                }
            });
    }
});

export const { logout } = authSlice.actions;
export { loginThunk }
export default authSlice.reducer;