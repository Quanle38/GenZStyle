import axiosInstance from "../../app/axios";
import { productURL } from "./productURL";
import type { ProductListResponse, ProductResponse} from "./productTypes";
import type { AxiosResponse } from "axios";

export const productAPI = {
  getById: (id: string): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.get(productURL.GET_BY_ID + `${id}`);
  },
  search: (query : string): Promise<AxiosResponse<ProductListResponse>> => {
    return axiosInstance.get(productURL.SEARCH + `?${query}`);
  }
};
