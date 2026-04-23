export interface Coupon {
  id: string;
  code: string;
  start_time: string;
  end_time: string;
  type: 'PERCENT' | 'FIXED';
  usage_limit: number;
  used_count: number;
  value: string; // API trả về string "14.00"
  max_discount: string | null;
  condition_set_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppliedCoupon {
  id: number;
  cart_id: string;
  coupon_id: string;
  applied_at: string;
  coupon?: Coupon; // Có mặt trong GET list, có thể không có trong POST response
}

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Payload cho request POST
export interface ApplyCouponPayload {
  coupon_code: string;
}