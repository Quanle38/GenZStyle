import axiosInstance from "../../app/axios";
import { authURL } from "./authURL";
import type { LoginRequest, AuthData, DataResponse, RefreshResponse } from "./authTypes";
import type {  AxiosResponse } from "axios";

export const authAPI = {
    login: (body: LoginRequest) : Promise<AxiosResponse<DataResponse<AuthData>>> => {
        return axiosInstance.post(authURL.LOGIN, body);
    },

    refresh: () : Promise<AxiosResponse<DataResponse<RefreshResponse>>> => {
        return axiosInstance.post(authURL.REFRESHTOKEN);
    },
};