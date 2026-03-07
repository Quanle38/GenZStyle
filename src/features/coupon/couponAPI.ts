import axiosInstance from "../../app/axios";
import type { GetAllCouponByUserResponse, GetAllCouponResponse, GetCouponByCodeResponse } from "./couponType";
import { couponURL } from "./couponURL";
import type { AxiosResponse } from "axios";


export const couponAPI = {

  getByCode: (code: string): Promise<AxiosResponse<GetCouponByCodeResponse>> => {
    return axiosInstance.get(
      couponURL.GET_BY_CODE + `?code=${code}`
    );
  },

  getAllByUserId: (): Promise<AxiosResponse<GetAllCouponByUserResponse>> => {
    return axiosInstance.get(couponURL.GET_ALL_BY_USER_ID);
  },

  getAllCoupon: (): Promise<AxiosResponse<GetAllCouponResponse>> => {
    return axiosInstance.get(couponURL.GET_ALL_COUPON);
  },


};
