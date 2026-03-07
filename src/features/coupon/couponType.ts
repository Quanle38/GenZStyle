/* =========================
   CONDITION
========================= */

export type CouponConditionType =
  | "MIN_ORDER_VALUE"
  | "TIER"
  | "NEW_USER"
  | "DAY_OF_WEEK"
  | "HOUR_OF_DAY";

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

/* =========================
   COUPON
========================= */

export type CouponType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  start_time: string;
  end_time: string;
  type: CouponType;
  usage_limit: number;
  used_count: number;
  value: string;
  max_discount: string | null;
  condition_set_id: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  conditionSet: ConditionSet;
}

/* =========================
   API RESPONSES
========================= */

// GET /coupon/by-code
export interface GetCouponByCodeResponse {
  success: boolean;
  data: Coupon;
}

// GET /coupon/get-all-by-user-id
export interface CouponWithValid extends Coupon {
  is_valid: boolean;
}

export interface GetAllCouponByUserResponse {
  success: boolean;
  data: CouponWithValid[];
}

// POST /coupon/apply
export interface ApplyCouponRequest {
  code: string;
  cartInfo: {
    subtotal: number;
    productIds: string[];
  };
}

export interface ApplyCouponResponse {
  success: boolean;
  discount: number;
  coupon: string;
}

// POST /coupon/create
export interface CreateCouponRequest {
  code: string;
  type: CouponType;
  value: number;
  start_time: string;
  end_time: string;
  usage_limit: number;
  max_discount?: number | null;
  conditions?: {
    condition_type: CouponConditionType;
    condition_value: string;
  }[];
}

export interface CreateCouponResponse {
  success: boolean;
  data: Coupon;
}

// GET /coupon (ADMIN)
export interface GetAllCouponResponse {
  success: boolean;
  data: Coupon[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}
