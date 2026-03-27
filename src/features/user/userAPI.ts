import axiosInstance from "../../app/axios";
import type { AxiosResponse } from "axios";
import type { DataResponse, UserData } from "../auth/authTypes";
import { userURL } from "./userURL";
import type { CreateUserRequest, UserProfile } from "./userTypes";

export const userAPI = {
  update: (
    id: string,
    body: FormData
  ): Promise<AxiosResponse<DataResponse<UserData>>> => {
    return axiosInstance.patch(userURL.UPDATE + `/${id}`, body);
  },

  getProfile: (id: string): Promise<AxiosResponse<DataResponse<UserData>>> => {
    return axiosInstance.get(userURL.GET_USER + `/${id}`);
  },
  getAll: (): Promise<AxiosResponse<DataResponse<UserProfile[]>>> => {
    return axiosInstance.get(userURL.GET_ALL);
  },
  delete(id: string): Promise<AxiosResponse<void>> {
    return axiosInstance.delete(`${userURL.DELETE}/${id}`);
  },
  create: (body: CreateUserRequest): Promise<AxiosResponse<DataResponse<UserProfile>>> => {
    return axiosInstance.post(userURL.CREATE, body);
  }
};
