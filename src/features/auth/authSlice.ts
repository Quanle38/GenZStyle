/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import type { AuthData, DataResponse, LoginRequest, UserData, RefreshResponse } from "./authTypes";
import { authAPI } from "./authAPI";

interface AuthState {
    user: UserData | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: AuthState = {
    user: Cookies.get("user") ? JSON.parse(Cookies.get("user") as string) : null,
    accessToken: Cookies.get("access_token") || null,
    refreshToken: Cookies.get("refresh_token") || null,
    status: "idle",
    error: null,
};

// ======================================
// 🔥 LOGIN
// ======================================
export const login = createAsyncThunk<
    DataResponse<AuthData>,
    LoginRequest,
    { rejectValue: string }
>(
    "auth/login",
    async (body, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(body);
            const authData = response.data.data; // 🎯 lấy đúng "data"

            Cookies.set("access_token", authData.access_token, { expires: 1 / 24, secure: true });
            Cookies.set("refresh_token", authData.refresh_token, { expires: 7, secure: true });
            Cookies.set("user", JSON.stringify(authData.user), { expires: 7, secure: true });

            return response.data;
        } catch (err: any) {
            const error = err.response?.data?.message || "Đăng nhập thất bại!";
            return rejectWithValue(error);
        }
    }
);

// ======================================
// 🔥 REFRESH TOKEN
// ======================================
export const refreshToken = createAsyncThunk<
    DataResponse<RefreshResponse>,
    void,
    { rejectValue: string }
>(
    "auth/refresh",
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.refresh();
            const ref = response.data.data;

            Cookies.set("access_token", ref.access_token, { expires: 1 / 24, secure: true });
            Cookies.set("refresh_token", ref.refresh_token, { expires: 7, secure: true });

            return response.data;
        } catch (err) {
             console.log(err)
            return rejectWithValue("Không thể làm mới token!");
           
        }
    }
);

// ======================================
// 🔥 LOGOUT
// ======================================
export const logout = createAsyncThunk("auth/logout", async () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user");
});

// ======================================
// 🔥 SLICE
// ======================================
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        // LOGIN
        builder
            .addCase(login.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<DataResponse<AuthData>>) => {
                state.status = "succeeded";
                state.accessToken = action.payload.data.access_token;
                state.refreshToken = action.payload.data.refresh_token;
                state.user = action.payload.data.user;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
                state.accessToken = null;
                state.refreshToken = null;
                state.user = null;
            });

        // REFRESH TOKEN
        builder
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<DataResponse<RefreshResponse>>) => {
                state.accessToken = action.payload.data.access_token;
                state.refreshToken = action.payload.data.refresh_token;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.accessToken = null;
                state.refreshToken = null;
                state.user = null;
            });

        // LOGOUT
        builder.addCase(logout.fulfilled, (state) => {
            state.status = "idle";
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.error = null;
        });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
