import axiosInstance from "../../app/axios";
import type { ApplyCouponRequest, ApplyCouponResponse, CreateCouponRequest, CreateCouponResponse, GetAllCouponByUserResponse, GetAllCouponResponse, GetCouponByCodeResponse } from "./couponType";
import { couponURL } from "./couponURL";
import type { AxiosResponse } from "axios";


export const couponAPI = {

  getByCode: (code: string): Promise<AxiosResponse<GetCouponByCodeResponse>> => {
    return axiosInstance.get(
      `${couponURL.GET_BY_CODE}/${code}`
    );
  },

  getAllByUserId: (): Promise<AxiosResponse<GetAllCouponByUserResponse>> => {
    return axiosInstance.get(couponURL.GET_ALL_BY_USER_ID);
  },

  getAllCoupon: (): Promise<AxiosResponse<GetAllCouponResponse>> => {
    return axiosInstance.get(couponURL.GET_ALL_COUPON);
  },
  createCoupon: (data: CreateCouponRequest): Promise<AxiosResponse<CreateCouponResponse>> => {
    return axiosInstance.post(couponURL.CREATE_COUPON, data);
  },

  applyCoupon: (data: ApplyCouponRequest): Promise<AxiosResponse<ApplyCouponResponse>> => {
    return axiosInstance.post(couponURL.APPLY, data);
  },
  
 updateCoupon: (id: string, data: Partial<CreateCouponRequest>): Promise<AxiosResponse<CreateCouponResponse>> => {
    return axiosInstance.put(`${couponURL.UPDATE}/${id}`, data); 
},

  deleteCoupon: (id: string): Promise<AxiosResponse<{ success: boolean }>> => {
    return axiosInstance.delete(`${couponURL.DELETE}/${id}`);
  },

};
