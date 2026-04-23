import axiosInstance from "../../app/axios";
import { paymentURL } from "./paymentURL";
import type {
    CreatePaymentPayload,
    CreatePaymentResponse,
    PaymentStatusResponse,
} from "./paymentType";
import type { AxiosResponse } from "axios";

export const paymentAPI = {
    createPayment(
        data: CreatePaymentPayload
    ): Promise<AxiosResponse<CreatePaymentResponse>> {
        return axiosInstance.post(paymentURL.CREATE, data);
    },

    getPaymentStatus(orderCode: string): Promise<AxiosResponse<PaymentStatusResponse>> {
        return axiosInstance.get(`${paymentURL.GET_STATUS}/${orderCode}/status`);
    }
};