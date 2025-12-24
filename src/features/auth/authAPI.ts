import axiosInstance from "../../app/axios";
import { authURL } from "./authURL";
import type { LoginRequest, AuthData, DataResponse, RefreshResponse, UserData} from "./authTypes";
import type {  AxiosResponse } from "axios";

export const authAPI = {
    login: (body: LoginRequest) : Promise<AxiosResponse<DataResponse<AuthData>>> => {
        return axiosInstance.post(authURL.LOGIN, body);
    },

    refresh: () : Promise<AxiosResponse<DataResponse<RefreshResponse>>> => {
        return axiosInstance.post(authURL.REFRESHTOKEN);
    },
   register: (data: FormData) : Promise<AxiosResponse<DataResponse<AuthData>>> => {
    return axiosInstance.post(authURL.REGISTER, data, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    },
    logout: (): Promise<AxiosResponse<DataResponse<null>>> => {
        return axiosInstance.post(authURL.LOGOUT);
    },
    me: (): Promise<AxiosResponse<DataResponse<{ user: UserData }>>> => {
    return axiosInstance.get(authURL.ME);
},
};