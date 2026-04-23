import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { couponCartAPI } from "./cartCouponAPI";
import type { 
    AppliedCoupon, 
    ApplyCouponPayload, 
    BaseResponse 
} from "./cartCouponType";

/* ================= STATE ================= */

interface CartCouponState {
    appliedCoupons: AppliedCoupon[];
    loading: boolean;
    error: string | null;
}

const initialState: CartCouponState = {
    appliedCoupons: [],
    loading: false,
    error: null,
};

/* ================= THUNKS ================= */

// GET ALL APPLIED COUPONS
export const getAppliedCouponsThunk = createAsyncThunk<
    BaseResponse<AppliedCoupon[]>
>("cartCoupon/getAll", async () => {
    const res = await couponCartAPI.getAppliedCoupons();
    return res.data;
});

// APPLY COUPON
export const applyCouponThunk = createAsyncThunk<
    BaseResponse<AppliedCoupon>,
    ApplyCouponPayload
>("cartCoupon/apply", async (body) => {
    const res = await couponCartAPI.applyCoupon(body);
    return res.data;
});

// REMOVE COUPON
export const removeCouponThunk = createAsyncThunk<
    string, // Trả về ID để filter dưới local state
    string
>("cartCoupon/remove", async (couponId) => {
    await couponCartAPI.removeCoupon(couponId);
    return couponId;
});

/* ================= SLICE ================= */

const cartCouponSlice = createSlice({
    name: "cartCoupon",
    initialState,
    reducers: {
        clearCouponError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            /* --- GET ALL --- */
            .addCase(getAppliedCouponsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAppliedCouponsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.appliedCoupons = action.payload.data;
            })
            .addCase(getAppliedCouponsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch applied coupons";
            })

            /* --- APPLY --- */
            .addCase(applyCouponThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(applyCouponThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Thêm coupon mới vào danh sách hiện có
                state.appliedCoupons.push(action.payload.data);
            })
            .addCase(applyCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Apply coupon failed";
            })

            /* --- REMOVE --- */
            .addCase(removeCouponThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeCouponThunk.fulfilled, (state, action) => {
                state.loading = false;
                // action.payload lúc này là couponId (string) trả về từ thunk
                state.appliedCoupons = state.appliedCoupons.filter(
                    (item) => item.coupon_id !== action.payload
                );
            })
            .addCase(removeCouponThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Remove coupon failed";
            });
    },
});

export const { clearCouponError } = cartCouponSlice.actions;
export default cartCouponSlice.reducer;