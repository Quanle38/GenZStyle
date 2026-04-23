/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentAPI } from "./paymentAPI";
import type {
    CreatePaymentPayload,
    CreatePaymentResponse,
    PaymentStatusResponse,
} from "./paymentType";
import type { AxiosError } from "axios";

export const createPaymentThunk = createAsyncThunk<
    CreatePaymentResponse,
    CreatePaymentPayload,
    { rejectValue: string }
>("payment/create", async (payload, thunkAPI) => {
    try {
        const res = await paymentAPI.createPayment(payload);
        return res.data;
    } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        return thunkAPI.rejectWithValue(
            error.response?.data?.message || "Create payment failed"
        );
    }
});

export const getPaymentStatusThunk = createAsyncThunk<
    PaymentStatusResponse,
    string,
    { rejectValue: string }
>("payment/getStatus", async (orderCode, thunkAPI) => {
    try {
        const res = await paymentAPI.getPaymentStatus(orderCode);
        return res.data;
    } catch (err: any) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message || "Get payment status failed"
        );
    }
});

interface PaymentState {
    data: CreatePaymentResponse | null;
    statusResult: PaymentStatusResponse | null; // ⭐ NEW
    loading: boolean;
    error: string | null;
}

const initialState: PaymentState = {
    data: null,
    statusResult: null, // ⭐ NEW
    loading: false,
    error: null,
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        clearPayment(state) {
            state.data = null;
            state.statusResult = null; // ⭐ reset luôn
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // ======================
            // CREATE PAYMENT
            // ======================
            .addCase(createPaymentThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPaymentThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(createPaymentThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Error occurred";
            })

            // ======================
            // GET PAYMENT STATUS
            // ======================
            .addCase(getPaymentStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentStatusThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.statusResult = action.payload; // ⭐ lưu status
            })
            .addCase(getPaymentStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Error occurred";
            });
    },
});

export const { clearPayment } = paymentSlice.actions;
export default paymentSlice.reducer;