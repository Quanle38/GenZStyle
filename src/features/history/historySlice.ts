/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { historyAPI } from "./historyAPI";
import type { Order, OrderItem } from "./historyType";

interface HistoryState {
    orders: Order[];
    selectedOrder: Order | null;
    orderItems: OrderItem[];        // ← thêm
    loading: boolean;
    loadingDetail: boolean;         // ← thêm
    error: string | null;
}

const initialState: HistoryState = {
    orders: [],
    selectedOrder: null,
    orderItems: [],                 // ← thêm
    loading: false,
    loadingDetail: false,           // ← thêm
    error: null,
};

/* =========================
    THUNKS
========================= */

export const getMyOrdersThunk = createAsyncThunk<Order[], void, { rejectValue: string }>(
    "history/getMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            const res = await historyAPI.getMyOrders();
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy lịch sử đơn hàng");
        }
    }
);

export const getOrderItemsThunk = createAsyncThunk<OrderItem[], string, { rejectValue: string }>(
    "history/getOrderItems",
    async (id, { rejectWithValue }) => {
        try {
            const res = await historyAPI.getOrderItems(id);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Lỗi lấy chi tiết đơn hàng");
        }
    }
);

/* =========================
    SLICE
========================= */

const historySlice = createSlice({
    name: "history",
    initialState,
    reducers: {
        clearSelectedOrder(state) {
            state.selectedOrder = null;
        },
        clearOrderItems(state) {
            state.orderItems = [];
        },
        resetHistoryState(state) {
            state.orders = [];
            state.orderItems = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyOrdersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyOrdersThunk.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(getMyOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown Error";
            })

            .addCase(getOrderItemsThunk.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(getOrderItemsThunk.fulfilled, (state, action: PayloadAction<OrderItem[]>) => {
                state.loadingDetail = false;
                state.orderItems = action.payload;
            })
            .addCase(getOrderItemsThunk.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload ?? "Unknown Error";
            });
    },
});

export const { clearSelectedOrder, clearOrderItems, resetHistoryState } = historySlice.actions;
export default historySlice.reducer;