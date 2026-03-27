import axiosInstance from "../../app/axios";
import { productURL } from "./productURL";
import type {
  ProductListResponse,
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListParams,
} from "./productTypes";
import type { AxiosResponse } from "axios";

export const productAPI = {
  // GET ALL (pagination)
  getAll: (params?: ProductListParams): Promise<AxiosResponse<ProductListResponse>> => {
    return axiosInstance.get(productURL.GET_ALL, { params });
  },

  // GET BY ID
  getById: (id: string): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.get(productURL.GET_BY_ID + `${id}`);
  },

  // SEARCH
  search: (query: string): Promise<AxiosResponse<ProductListResponse>> => {
    return axiosInstance.get(productURL.SEARCH + `?${query}`);
  },

  // CREATE (ADMIN)
  create: (body: ProductCreateRequest): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.post(productURL.CREATE, body);
  },

  // UPDATE (ADMIN)
  update: (id: string, body: ProductUpdateRequest): Promise<AxiosResponse<ProductResponse>> => {
    return axiosInstance.put(productURL.UPDATE + `${id}`, body);
  },

  // DELETE (ADMIN)
  delete: (id: string): Promise<AxiosResponse<void>> => {
    return axiosInstance.delete(productURL.DELETE + `${id}`);
  },
};