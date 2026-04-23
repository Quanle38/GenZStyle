import axiosInstance from "../../app/axios";
import type { AxiosResponse } from "axios";
import type { GetMyOrdersResponse, GetOrderItemsResponse } from "./historyType";
import { historyURL } from "./historyURL";


export const historyAPI = {
    getMyOrders: (): Promise<AxiosResponse<GetMyOrdersResponse>> => {
        return axiosInstance.get(historyURL.GET_MY_ORDERS);
    },
    getOrderItems: (id: string): Promise<AxiosResponse<GetOrderItemsResponse>> => {
        return axiosInstance.get(`${historyURL.GET_ITEMS}/${id}/items`);
    },
};