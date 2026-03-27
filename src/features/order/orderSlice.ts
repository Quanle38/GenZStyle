/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { orderAPI } from "./orderAPI";
import type {
    Order,
    OrderItem,
    OrderStatistics,
    CreateOrderRequest,
    UpdateOrderStatusRequest,
} from "./orderTypes";

/* =========================
   STATE
========================= */
interface OrderState {
    allOrders: Order[];
    selectedOrder: Order | null;
    orderItems: OrderItem[];
    statistics: OrderStatistics | null;
    loading: boolean;
    loadingDetail: boolean;
    error: string | null;
}

const initialState: OrderState = {
    allOrders: [],
    selectedOrder: null,
    orderItems: [],
    statistics: null,
    loading: false,
    loadingDetail: false,
    error: null,
};

/* =========================
   THUNKS
========================= */

/** Lấy tất cả đơn hàng của user hiện tại */
export const getAllOrdersThunk = createAsyncThunk<
    Order[], void, { rejectValue: string }
>("order/getAll", async (_, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getAll();
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch orders");
        return rejectWithValue("Unexpected error");
    }
});

/** Lấy đơn hàng theo ID */
export const getOrderByIdThunk = createAsyncThunk<
    Order, string, { rejectValue: string }
>("order/getById", async (id, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getById(id);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch order");
        return rejectWithValue("Unexpected error");
    }
});

/** Lấy đơn hàng theo trạng thái */
export const getOrdersByStatusThunk = createAsyncThunk<
    Order[], string, { rejectValue: string }
>("order/getByStatus", async (status, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getByStatus(status);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch orders by status");
        return rejectWithValue("Unexpected error");
    }
});

/** Lấy items của đơn hàng */
export const getOrderItemsThunk = createAsyncThunk<
    OrderItem[], string, { rejectValue: string }
>("order/getItems", async (id, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getItems(id);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch order items");
        return rejectWithValue("Unexpected error");
    }
});

/** Lấy thống kê đơn hàng */
export const getOrderStatisticsThunk = createAsyncThunk<
    OrderStatistics, void, { rejectValue: string }
>("order/getStatistics", async (_, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getStatistics();
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch statistics");
        return rejectWithValue("Unexpected error");
    }
});

/** Lấy đơn hàng trong khoảng thời gian */
export const getOrdersByDateRangeThunk = createAsyncThunk<
    Order[],
    { startDate: string; endDate: string },
    { rejectValue: string }
>("order/getByDateRange", async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
        const res = await orderAPI.getByDateRange(startDate, endDate);
        return res.data.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to fetch orders by date range");
        return rejectWithValue("Unexpected error");
    }
});

/** Tạo đơn hàng mới */
export const createOrderThunk = createAsyncThunk<
    Order, CreateOrderRequest, { rejectValue: string }
>("order/create", async (data, { rejectWithValue }) => {
    try {
        const res = await orderAPI.create(data);
        return res.data.data;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to create order");
        return rejectWithValue("Unexpected error");
    }
});

/** Cập nhật trạng thái đơn hàng */
export const updateOrderStatusThunk = createAsyncThunk<
    Order,
    { id: string; data: UpdateOrderStatusRequest },
    { rejectValue: string }
>("order/updateStatus", async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await orderAPI.updateStatus(id, data);
        return res.data.data;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to update order status");
        return rejectWithValue("Unexpected error");
    }
});

/** Hủy đơn hàng */
export const cancelOrderThunk = createAsyncThunk<
    Order, string, { rejectValue: string }
>("order/cancel", async (id, { rejectWithValue }) => {
    try {
        const res = await orderAPI.cancel(id);
        return res.data.data;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to cancel order");
        return rejectWithValue("Unexpected error");
    }
});

/** Xóa đơn hàng */
export const deleteOrderThunk = createAsyncThunk<
    string, string, { rejectValue: string }
>("order/delete", async (id, { rejectWithValue }) => {
    try {
        await orderAPI.delete(id);
        return id;
    } catch (error: any) {
        if (axios.isAxiosError(error))
            return rejectWithValue(error.response?.data?.message ?? "Failed to delete order");
        return rejectWithValue("Unexpected error");
    }
});

/* =========================
   SLICE
========================= */
const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        clearSelectedOrder(state) {
            state.selectedOrder = null;
            state.orderItems = [];
        },
        clearOrderError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ===== GET ALL =====
            .addCase(getAllOrdersThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllOrdersThunk.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                state.allOrders = action.payload;
            })
            .addCase(getAllOrdersThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY ID =====
            .addCase(getOrderByIdThunk.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(getOrderByIdThunk.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loadingDetail = false;
                state.selectedOrder = action.payload;
            })
            .addCase(getOrderByIdThunk.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY STATUS =====
            .addCase(getOrdersByStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrdersByStatusThunk.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                state.allOrders = action.payload;
            })
            .addCase(getOrdersByStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET ITEMS =====
            .addCase(getOrderItemsThunk.pending, (state) => {
                state.loadingDetail = true;
            })
            .addCase(getOrderItemsThunk.fulfilled, (state, action: PayloadAction<OrderItem[]>) => {
                state.loadingDetail = false;
                state.orderItems = action.payload;
            })
            .addCase(getOrderItemsThunk.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload ?? null;
            })

            // ===== GET STATISTICS =====
            .addCase(getOrderStatisticsThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderStatisticsThunk.fulfilled, (state, action: PayloadAction<OrderStatistics>) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(getOrderStatisticsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== GET BY DATE RANGE =====
            .addCase(getOrdersByDateRangeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrdersByDateRangeThunk.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.loading = false;
                state.allOrders = action.payload;
            })
            .addCase(getOrdersByDateRangeThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== CREATE =====
            .addCase(createOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrderThunk.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                state.allOrders.unshift(action.payload);
            })
            .addCase(createOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== UPDATE STATUS =====
            .addCase(updateOrderStatusThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatusThunk.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                const idx = state.allOrders.findIndex(o => o.id === action.payload.id);
                if (idx !== -1) state.allOrders[idx] = action.payload;
                if (state.selectedOrder?.id === action.payload.id) state.selectedOrder = action.payload;
            })
            .addCase(updateOrderStatusThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== CANCEL =====
            .addCase(cancelOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelOrderThunk.fulfilled, (state, action: PayloadAction<Order>) => {
                state.loading = false;
                const idx = state.allOrders.findIndex(o => o.id === action.payload.id);
                if (idx !== -1) state.allOrders[idx] = action.payload;
                if (state.selectedOrder?.id === action.payload.id) state.selectedOrder = action.payload;
            })
            .addCase(cancelOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            })

            // ===== DELETE =====
            .addCase(deleteOrderThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOrderThunk.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.allOrders = state.allOrders.filter(o => o.id !== action.payload);
                if (state.selectedOrder?.id === action.payload) state.selectedOrder = null;
            })
            .addCase(deleteOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? null;
            });
    },
});

export const { clearSelectedOrder, clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;