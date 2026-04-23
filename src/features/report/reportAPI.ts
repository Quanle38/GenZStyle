// features/report/reportAPI.ts
import axiosInstance from "../../app/axios";
import type { AxiosResponse } from "axios";
import { reportURL } from "./reportURL";
import type {
    GetOverviewResponse,
    GetSummaryResponse,
    GetRevenueByMonthResponse,
    GetTopProductsResponse,
    GetCategoryRevenueResponse,
    GetOrderStatusResponse,
    GetNewUsersResponse,
} from "./reportType";

export const reportAPI = {
    getOverview: (year?: number): Promise<AxiosResponse<GetOverviewResponse>> =>
        axiosInstance.get(reportURL.GET_OVERVIEW, {
            params: year ? { year } : undefined,
        }),

    getSummary: (year?: number): Promise<AxiosResponse<GetSummaryResponse>> =>
        axiosInstance.get(reportURL.GET_SUMMARY, {
            params: year ? { year } : undefined,
        }),

    getRevenueByMonth: (year?: number): Promise<AxiosResponse<GetRevenueByMonthResponse>> =>
        axiosInstance.get(reportURL.GET_REVENUE_BY_MONTH, {
            params: year ? { year } : undefined,
        }),

    getTopProducts: (limit = 5): Promise<AxiosResponse<GetTopProductsResponse>> =>
        axiosInstance.get(reportURL.GET_TOP_PRODUCTS, { params: { limit } }),

    getCategoryRevenue: (): Promise<AxiosResponse<GetCategoryRevenueResponse>> =>
        axiosInstance.get(reportURL.GET_CATEGORY_REVENUE),

    getOrderStatus: (): Promise<AxiosResponse<GetOrderStatusResponse>> =>
        axiosInstance.get(reportURL.GET_ORDER_STATUS),

    getNewUsers: (months = 6): Promise<AxiosResponse<GetNewUsersResponse>> =>
        axiosInstance.get(reportURL.GET_NEW_USERS, { params: { months } }),
};