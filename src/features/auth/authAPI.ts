import axiosInstance from "../../app/axios";
import { authURL } from "./authURL";
import type { LoginRequest, AuthData, DataResponse, RefreshResponse } from "./authTypes";

export const authAPI = {
    login: (body: LoginRequest) => {
        return axiosInstance.post<DataResponse<AuthData>>(authURL.LOGIN, body);
    },

    refresh: () => {
        return axiosInstance.post<DataResponse<RefreshResponse>>(authURL.REFRESHTOKEN);
    },
};
