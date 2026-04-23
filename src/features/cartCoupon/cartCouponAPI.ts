import axiosInstance from "../../app/axios";
import type { AxiosResponse } from "axios";
import { couponCartURL } from "./cartCouponURL";
import { type AppliedCoupon, type ApplyCouponPayload, type BaseResponse } from "./cartCouponType";

export const couponCartAPI = {
  // GET: Lấy danh sách coupon đã áp dụng
  getAppliedCoupons: (): Promise<AxiosResponse<BaseResponse<AppliedCoupon[]>>> => {
    return axiosInstance.get(couponCartURL.GET_APPLY_COUPON);
  },

  // POST: Áp dụng coupon mới (truyền coupon_code)
  applyCoupon: (data: ApplyCouponPayload): Promise<AxiosResponse<BaseResponse<AppliedCoupon>>> => {
    return axiosInstance.post(couponCartURL.APPLY_COUPON, data);
  },

  // DELETE: Xóa coupon (truyền id của coupon)
  removeCoupon: (id: string): Promise<AxiosResponse<BaseResponse<null>>> => {
    return axiosInstance.delete(`${couponCartURL.DELETE}${id}`);
  },
};