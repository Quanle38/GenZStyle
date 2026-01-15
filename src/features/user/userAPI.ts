import axiosInstance from "../../app/axios";
import type {  AxiosResponse } from "axios";
import type { UpdateRequestBodyUser } from "./userTypes";
import type { DataResponse, UserData } from "../auth/authTypes";
import { userURL } from "./userURL";

export const userAPI = {
    update: (id : string ,body: UpdateRequestBodyUser) : Promise<AxiosResponse<DataResponse<UserData>>> => {
        return axiosInstance.patch(userURL.UPDATE + `/${id}`, body);
    },
    getProfile: (id : string) : Promise<AxiosResponse<DataResponse<UserData>>> => {
        return axiosInstance.get(userURL.GET_USER + `/${id}`);
    }
}