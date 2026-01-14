import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthData, LoginRequest, UserData } from "./authTypes";
import { authAPI } from "./authAPI";
import { removeToken, setRefreshToken, setToken } from "../../utils/cookie";
import { extractErrorMessage } from "../../utils/extractErrorMessage";



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


// 🔥 LOGIN
const loginThunk = createAsyncThunk(
    "auth/login",
    async (body: LoginRequest, thunkAPI) => {
        try {
            const response = await authAPI.login(body);
            return response.data.data as AuthData;
        } catch (error) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error));
        }
    }
);

// 🔥 REGISTER
const registerThunk = createAsyncThunk(
    "auth/register",
    async (body: FormData, thunkAPI) => {
        try {
            const response = await authAPI.register(body);
            return response.data.data as AuthData;
        } catch (error) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error));
        }
    }
);

const logoutThunk = createAsyncThunk(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const response = await authAPI.logout();
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error));
        } finally {
            thunkAPI.dispatch(logout())
        }

    }
);

const meThunk = createAsyncThunk(
    "auth/me",
    async (_, thunkAPI) => {
        try {
            const response = await authAPI.me();
            console.log(response.data.data.user);
            return response.data.data.user as UserData;
        } catch (error) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error));
        }
    }
);

const reFreshThunk = createAsyncThunk(
    "auth/refreshToken",
    async (_, thunkAPI) => {
        try {
            const response = await authAPI.refresh();
            console.log(response.data.data.access_token);
            return response.data.data.access_token;
        } catch (error) {
            return thunkAPI.rejectWithValue(extractErrorMessage(error));
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
            removeToken();
        }
    },
    extraReducers: (builder) => {
        builder
            // 🎯 LOGIN
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                setToken(action.payload.access_token);
                state.user = action.payload.user;
                state.error = null;

            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;

                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Login failed";
                }
            })

            // 🎯 REGISTER
            .addCase(registerThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.error = null;
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.isLoading = false;

                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Register failed";
                }
            })

            // 🎯 LOGOUT
            .addCase(logoutThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.isLoading = false;

                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Logout failed";
                }
            })
            // 🎯 ME
            .addCase(meThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(meThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.error = null;
            })
            .addCase(meThunk.rejected, (state, action) => {
                state.isLoading = false;

                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Fetch user failed";
                }
            })
            // 🎯 REFRESH
            .addCase(reFreshThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(reFreshThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                setRefreshToken(action.payload)
            })
            .addCase(reFreshThunk.rejected, (state, action) => {
                state.isLoading = false;
                if (action.payload) {
                    state.error = (action.payload as { message: string }).message;
                } else {
                    state.error = action.error.message || "Fetch refresh failed";
                }
            });
    }
});


export { loginThunk, registerThunk, logoutThunk, meThunk, reFreshThunk };
export const { logout } = authSlice.actions;
export default authSlice.reducer;
