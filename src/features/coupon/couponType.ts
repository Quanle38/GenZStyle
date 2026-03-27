export type CouponConditionType = "MIN_ORDER_VALUE" | "TIER" | "NEW_USER" | "DAY_OF_WEEK" | "HOUR_OF_DAY";
export type CouponType = "PERCENT" | "FIXED";

export interface ConditionDetail {
  condition_detail_id: number;
  condition_set_id: string;
  condition_type: CouponConditionType;
  condition_value: string;
  is_deleted: boolean;
}

export interface ConditionSet {
  id: string;
  name: string;
  is_reusable: boolean;
  created_at: string;
  updated_at: string;
  details: ConditionDetail[];
}

export interface Coupon {
  id: string;
  code: string;
  start_time: string;
  end_time: string;
  type: CouponType;
  usage_limit: number;
  used_count: number;
  value: number; // Đổi sang number để tính toán
  max_discount: number | null;
  condition_set_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  conditionSet?: ConditionSet; // BE có include
}

export interface CouponWithValid extends Coupon {
  is_valid: boolean;
}

/* API REQUESTS & RESPONSES */
export interface ApplyCouponRequest {
  code: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  data: {
    discountAmount: number;
    couponCode: string;
  };
}

export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  value: number;
  start_time: string;
  end_time: string;
  usage_limit: number;
  max_discount?: number | null;
  condition_set_id?: string | null;
  conditions?: {
    condition_type: CouponConditionType;
    condition_value: string;
  }[];
}

export interface GetAllCouponResponse {
  success: boolean;
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
export interface GetCouponByCodeResponse {
  success: boolean;
  data: Coupon;
}

export interface GetAllCouponByUserResponse {
  success: boolean;
  data: CouponWithValid[];
}

export interface CreateCouponResponse {
  success: boolean;
  data: Coupon;
}