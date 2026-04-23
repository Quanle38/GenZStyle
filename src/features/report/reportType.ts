// features/report/reportType.ts

/* ── Primitive rows ── */
export interface RevenueByMonth {
    month: number;   // 1–12
    revenue: number;
    orders: number;
}

export interface TopProduct {
    name: string;
    sold: number;
}

export interface CategoryRevenue {
    name: string;
    value: number; // % phần trăm
}

export interface OrderStatusItem {
    name: string;  // "Completed" | "Processing" | "Cancelled" | "Pending"
    value: number; // % phần trăm
}

export interface NewUsersByMonth {
    month: number;
    users: number;
}

export interface ReportSummary {
    totalRevenue:     number;
    totalOrders:      number;
    newUsers:         number;
    returnCancelRate: number;
}

/* ── Full overview response ── */
export interface OverviewData {
    summary:              ReportSummary;
    revenueByMonth:       RevenueByMonth[];
    topProducts:          TopProduct[];
    categoryRevenue:      CategoryRevenue[];
    orderStatusBreakdown: OrderStatusItem[];
    newUsersByMonth:      NewUsersByMonth[];
}

/* ── API response wrappers ── */
export interface GetOverviewResponse {
    success: boolean;
    data:    OverviewData;
}

export interface GetSummaryResponse {
    success: boolean;
    data:    ReportSummary;
}

export interface GetRevenueByMonthResponse {
    success: boolean;
    data:    RevenueByMonth[];
}

export interface GetTopProductsResponse {
    success: boolean;
    data:    TopProduct[];
}

export interface GetCategoryRevenueResponse {
    success: boolean;
    data:    CategoryRevenue[];
}

export interface GetOrderStatusResponse {
    success: boolean;
    data:    OrderStatusItem[];
}

export interface GetNewUsersResponse {
    success: boolean;
    data:    NewUsersByMonth[];
}