import axiosInstance from "../../app/axios";
import { orderURL } from "./orderURL";
import type { 
    CreateOrderRequest, 
    CreateOrderResponse, 
    DeleteOrderResponse, 
    GetAllOrdersResponse, 
    GetOrderByIdResponse, 
    GetOrderItemsResponse, 
    GetOrderStatisticsResponse, 
    UpdateOrderStatusRequest, 
    UpdateOrderStatusResponse 
} from "./orderTypes";
import type { AxiosResponse } from "axios";

export const orderAPI = {
    getAll: (): Promise<AxiosResponse<GetAllOrdersResponse>> => {
        return axiosInstance.get(orderURL.GET_ALL);
    },

    getStatistics: (): Promise<AxiosResponse<GetOrderStatisticsResponse>> => {
        return axiosInstance.get(orderURL.GET_STATISTICS);
    },

    getByDateRange: (startDate: string, endDate: string): Promise<AxiosResponse<GetAllOrdersResponse>> => {
        return axiosInstance.get(orderURL.GET_DATE_RANGE + `?startDate=${startDate}&endDate=${endDate}`);
    },

    getByStatus: (status: string): Promise<AxiosResponse<GetAllOrdersResponse>> => {
        return axiosInstance.get(orderURL.GET_BY_STATUS + `/${status}`);
    },

    getById: (id: string): Promise<AxiosResponse<GetOrderByIdResponse>> => {
        return axiosInstance.get(orderURL.GET_BY_ID + `/${id}`);
    },

    getItems: (id: string): Promise<AxiosResponse<GetOrderItemsResponse>> => {
        return axiosInstance.get(orderURL.GET_ITEMS + `/${id}/items`);
    },

    create: (body: CreateOrderRequest): Promise<AxiosResponse<CreateOrderResponse>> => {
        return axiosInstance.post(orderURL.CREATE, body);
    },

    updateStatus: (id: string, body: UpdateOrderStatusRequest): Promise<AxiosResponse<UpdateOrderStatusResponse>> => {
        return axiosInstance.patch(orderURL.UPDATE_STATUS + `/${id}/status`, body);
    },

    cancel: (id: string): Promise<AxiosResponse<UpdateOrderStatusResponse>> => {
        return axiosInstance.patch(orderURL.CANCEL + `/${id}/cancel`);
    },

    delete: (id: string): Promise<AxiosResponse<DeleteOrderResponse>> => {
        return axiosInstance.delete(orderURL.DELETE + `/${id}`);
    }
};