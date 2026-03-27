/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { couponAPI } from "./couponAPI";
import type {
    Coupon,
    CouponWithValid,
    CreateCouponRequest
} from "./couponType";

/* =========================
   STATE
========================= */

interface CouponState {
    couponsByUser: CouponWithValid[];
    allCoupons: Coupon[];
    selectedCoupon: Coupon | null;
    loading: boolean;
    loadingDetail: boolean;
    error: string | null;
}

const initialState: CouponState = {
    couponsByUser: [],
    allCoupons: [],
    selectedCoupon: null,
    loading: false,
    loadingDetail: false,
    error: null,
};

/* =========================
   THUNKS
========================= */

export const getAllCouponByUserThunk = createAsyncThunk<
    CouponWithValid[],
    void,
    { rejectValue: string }
>("coupon/getAllByUser", async (_, { rejectWithValue }) => {
    try {
        const res = await couponAPI.getAllByUserId();
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(
                error.response?.data?.message ?? "Get coupon by user failed"
            );
        }
        return rejectWithValue("Unexpected error");
    }
});


export const getAllCouponThunk = createAsyncThunk<
    Coupon[],
    void,
    { rejectValue: string }
>("coupon/getAll", async (_, { rejectWithValue }) => {
    try {
        const res = await couponAPI.getAllCoupon();
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(
                error.response?.data?.message ?? "Get all coupons failed"
            );
        }
        return rejectWithValue("Unexpected error");
    }
});

export const getCouponByCodeThunk = createAsyncThunk<
    Coupon,
    string,
    { rejectValue: string }
>("coupon/getByCode", async (code, { rejectWithValue }) => {
    try {
        const res = await couponAPI.getByCode(code);
        return res.data.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message ?? "Get coupon by id failed");
    }
});

export const deleteCouponThunk = createAsyncThunk<string, string, { rejectValue: string }>(
    "coupon/delete",
    async (id, { rejectWithValue }) => {
        try {
            await couponAPI.deleteCoupon(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? "Delete failed");
        }
    }
);

export const createCouponThunk = createAsyncThunk<Coupon, CreateCouponRequest, { rejectValue: string }>(
    "coupon/create",
    async (data, { rejectWithValue }) => {
        try {
            const res = await couponAPI.createCoupon(data);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Create failed");
        }
    }
);

export const updateCouponThunk = createAsyncThunk<Coupon, { id: string; data: Partial<CreateCouponRequest> }, { rejectValue: string }>(
    "coupon/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const res = await couponAPI.updateCoupon(id, data);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Update failed");
        }
    }
);

/* =========================
   SLICE
========================= */

const couponSlice = createSlice({
    name: "coupon",
    initialState,
    reducers: {
        clearSelectedCoupon(state) {
            state.selectedCoupon = null;
        },
        clearCouponError(state) {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL BY USER =====
            .addCase(getAllCouponByUserThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCouponByUserThunk.fulfilled, (state, action: PayloadAction<CouponWithValid[]>) => {
                state.loading = false;
                state.couponsByUser = action.payload;
            })
            .addCase(getAllCouponByUserThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY CODE =====
            .addCase(getCouponByCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCouponByCodeThunk.fulfilled, (state, action: PayloadAction<Coupon>) => {
                state.loading = false;
                state.selectedCoupon = action.payload;
            })
            .addCase(getCouponByCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET ALL =====
            .addCase(getAllCouponThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllCouponThunk.fulfilled, (state, action: PayloadAction<Coupon[]>) => {
                state.loading = false;
                state.allCoupons = action.payload;
            })
            .addCase(getAllCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== DELETE =====
            .addCase(deleteCouponThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteCouponThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.allCoupons = state.allCoupons.filter(c => c.id !== action.payload);
                state.couponsByUser = state.couponsByUser.filter(c => c.id !== action.payload);
            })
            .addCase(deleteCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== CREATE =====
            .addCase(createCouponThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCouponThunk.fulfilled, (state, action: PayloadAction<Coupon>) => {
                state.loading = false;
                state.allCoupons.unshift(action.payload);
            })
            .addCase(createCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== UPDATE =====
            .addCase(updateCouponThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCouponThunk.fulfilled, (state, action: PayloadAction<Coupon>) => {
                state.loading = false;
                const index = state.allCoupons.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.allCoupons[index] = action.payload;
                }
            })
            .addCase(updateCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            });
    },
});

export const {
    clearSelectedCoupon,
    clearCouponError
} = couponSlice.actions;

export default couponSlice.reducer;