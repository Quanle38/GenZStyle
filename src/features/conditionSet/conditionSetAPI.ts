import type { AxiosResponse } from "axios";
import axiosInstance from "../../app/axios";
import { conditionSetURL } from "./conditionSetURL";
import type {
    CreateConditionSetRequest,
    CreateConditionSetResponse,
    DeleteConditionSetResponse,
    GetAllConditionSetsResponse,
    GetConditionSetByIdResponse,
    UpdateConditionSetRequest,
    UpdateConditionSetResponse,
} from "./conditionSetType";

export const conditionSetAPI = {

    // =====================
    // GET ALL
    // =====================
    getAll: (): Promise<AxiosResponse<GetAllConditionSetsResponse>> => {
        return axiosInstance.get(conditionSetURL.GET_ALL);
    },

    // =====================
    // GET BY ID
    // =====================
    getById: (id: string): Promise<AxiosResponse<GetConditionSetByIdResponse>> => {
        return axiosInstance.get(
            `${conditionSetURL.GET_BY_ID}/${id}`
        );
    },

    // =====================
    // CREATE
    // =====================
    create: (data: CreateConditionSetRequest): Promise<AxiosResponse<CreateConditionSetResponse>> => {
        return axiosInstance.post(
            conditionSetURL.CREATE,
            data
        );
    },

    // =====================
    // UPDATE
    // =====================
    update: (
        id: string,
        data: UpdateConditionSetRequest
    ): Promise<AxiosResponse<UpdateConditionSetResponse>> => {
        return axiosInstance.patch(
            `${conditionSetURL.UPDATE}/${id}`,
            data
        );
    },

    // =====================
    // DELETE
    // =====================
    delete: (id: string): Promise<AxiosResponse<DeleteConditionSetResponse>> => {
        return axiosInstance.delete(
            `${conditionSetURL.DELETE}/${id}`
        );
    },
};