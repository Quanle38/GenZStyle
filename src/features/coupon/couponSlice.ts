import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { couponAPI } from "./couponAPI";
import type {
    Coupon,
    CouponWithValid
} from "./couponType";

/* =========================
   STATE
========================= */

interface CouponState {
    couponsByUser: CouponWithValid[];
    allCoupons: Coupon[];
    selectedCoupon: Coupon | null;
    loading: boolean;
    error: string | null;
}

const initialState: CouponState = {
    couponsByUser: [],
    allCoupons: [],
    selectedCoupon: null,
    loading: false,
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

export const getCouponByCodeThunk = createAsyncThunk<
    Coupon,
    string,
    { rejectValue: string }
>("coupon/getByCode", async (code, { rejectWithValue }) => {
    try {
        const res = await couponAPI.getByCode(code);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return rejectWithValue(
                error.response?.data?.message ?? "Get coupon by code failed"
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
        // Lưu ý: res.data.data ở đây trả về Coupon[] theo interface GetAllCouponResponse
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
            .addCase(
                getAllCouponByUserThunk.fulfilled,
                (state, action: PayloadAction<CouponWithValid[]>) => {
                    state.loading = false;
                    state.couponsByUser = action.payload;
                }
            )
            .addCase(getAllCouponByUserThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY CODE =====
            .addCase(getCouponByCodeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getCouponByCodeThunk.fulfilled,
                (state, action: PayloadAction<Coupon>) => {
                    state.loading = false;
                    state.selectedCoupon = action.payload;
                }
            )
            .addCase(getCouponByCodeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET ALL (ADMIN/GENERAL) - MỚI THÊM =====
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
    },
});

export const {
    clearSelectedCoupon,
    clearCouponError
} = couponSlice.actions;

export default couponSlice.reducer;
