import axiosInstance from "../../app/axios";
import { cartURL } from "./cartURL";
import type { CartResponse, RemoveItemResponse, RequestAddItem, RequestUpdateCartItem, UpdateCartItemResponse } from "./cartTypes";
import type { AxiosResponse } from "axios";

export const cartAPI = {
   get: (): Promise<AxiosResponse<CartResponse>> => {
      return axiosInstance.get(cartURL.GET_CART);
   },
   add: (body: RequestAddItem): Promise<AxiosResponse<CartResponse>> => {
      return axiosInstance.post(cartURL.ADD_ITEM, body);
   },
   remove: (cartItemId: number): Promise<AxiosResponse<RemoveItemResponse>> => {
      return axiosInstance.delete(cartURL.REMOVE_ITEM + `?cartItemId=${cartItemId}`);
   },
   update: (
      cartItemId: number,
      body: RequestUpdateCartItem
   ): Promise<AxiosResponse<UpdateCartItemResponse>> =>
        axiosInstance.put(
      `${cartURL.UPDATE_ITEM}/${cartItemId}`,
      body
   )
   };