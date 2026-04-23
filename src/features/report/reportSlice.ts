// features/report/reportSlice.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { reportAPI } from "./reportAPI";
import type {
    OverviewData,
    ReportSummary,
    RevenueByMonth,
    TopProduct,
    CategoryRevenue,
    OrderStatusItem,
    NewUsersByMonth,
} from "./reportType";

/* ── State ── */
interface ReportState {
    overview:             OverviewData | null;
    summary:              ReportSummary | null;
    revenueByMonth:       RevenueByMonth[];
    topProducts:          TopProduct[];
    categoryRevenue:      CategoryRevenue[];
    orderStatusBreakdown: OrderStatusItem[];
    newUsersByMonth:      NewUsersByMonth[];

    loading:        boolean; // loading cho getOverview
    loadingSummary: boolean;
    error:          string | null;
}

const initialState: ReportState = {
    overview:             null,
    summary:              null,
    revenueByMonth:       [],
    topProducts:          [],
    categoryRevenue:      [],
    orderStatusBreakdown: [],
    newUsersByMonth:      [],

    loading:        false,
    loadingSummary: false,
    error:          null,
};

/* ── Thunks ── */

/** Lấy toàn bộ overview 1 lần — dùng cho OverviewPage */
export const getOverviewThunk = createAsyncThunk<
    OverviewData,
    number | undefined,
    { rejectValue: string }
>("report/getOverview", async (year, { rejectWithValue }) => {
    try {
        const res = await reportAPI.getOverview(year);
        return res.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Lỗi tải dữ liệu báo cáo"
        );
    }
});

/** Refresh riêng phần summary (4 stat cards) */
export const getSummaryThunk = createAsyncThunk<
    ReportSummary,
    number | undefined,
    { rejectValue: string }
>("report/getSummary", async (year, { rejectWithValue }) => {
    try {
        const res = await reportAPI.getSummary(year);
        return res.data.data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Lỗi tải summary"
        );
    }
});

/* ── Slice ── */
const reportSlice = createSlice({
    name: "report",
    initialState,
    reducers: {
        resetReportState(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (builder) => {
        builder
            /* getOverview */
            .addCase(getOverviewThunk.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(
                getOverviewThunk.fulfilled,
                (state, action: PayloadAction<OverviewData>) => {
                    state.loading             = false;
                    state.overview            = action.payload;
                    // Đồng thời set từng slice nhỏ để dùng selector riêng nếu cần
                    state.summary             = action.payload.summary;
                    state.revenueByMonth      = action.payload.revenueByMonth;
                    state.topProducts         = action.payload.topProducts;
                    state.categoryRevenue     = action.payload.categoryRevenue;
                    state.orderStatusBreakdown= action.payload.orderStatusBreakdown;
                    state.newUsersByMonth     = action.payload.newUsersByMonth;
                }
            )
            .addCase(getOverviewThunk.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload ?? "Unknown error";
            })

            /* getSummary */
            .addCase(getSummaryThunk.pending, (state) => {
                state.loadingSummary = true;
                state.error          = null;
            })
            .addCase(
                getSummaryThunk.fulfilled,
                (state, action: PayloadAction<ReportSummary>) => {
                    state.loadingSummary = false;
                    state.summary        = action.payload;
                }
            )
            .addCase(getSummaryThunk.rejected, (state, action) => {
                state.loadingSummary = false;
                state.error          = action.payload ?? "Unknown error";
            });
    },
});

export const { resetReportState } = reportSlice.actions;
export default reportSlice.reducer;