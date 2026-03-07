import axiosInstance from "../../app/axios";
import { addressURL } from "./addressURL";
import type { AxiosResponse } from "axios";
import type {
    UserAddress,
    GetAllUserAddressResponse,
    CreateUserAddressResponse,
    GetUserAddressDetailResponse,
    UpdateUserAddressResponse,
} from "./addressType";

export const addressAPI = {
    // GET ALL ADDRESS OF CURRENT USER
    getAll(): Promise<AxiosResponse<GetAllUserAddressResponse>> {
        return axiosInstance.get(addressURL.GET_ALL_BY_USER);
    },

    // GET ADDRESS DETAIL
    getDetail(
        addressId: number
    ): Promise<AxiosResponse<GetUserAddressDetailResponse>> {
        return axiosInstance.get(
            `${addressURL.GET_DETAIL_ADDRESS}${addressId}`
        );
    },

    // CREATE ADDRESS
    create(
        body: Partial<UserAddress>
    ): Promise<AxiosResponse<CreateUserAddressResponse>> {
        return axiosInstance.post(addressURL.CREATE, body);
    },

    // UPDATE ADDRESS
    edit(
        addressId: number,
        body: Partial<UserAddress>
    ): Promise<AxiosResponse<UpdateUserAddressResponse>> {
        return axiosInstance.put(
            `${addressURL.EDIT_ADDRESS}${addressId}`,
            body
        );
    },

    // DELETE ADDRESS
    delete(addressId: number): Promise<AxiosResponse<void>> {
        return axiosInstance.delete(
            `${addressURL.DELETE}${addressId}`
        );
    },
};
