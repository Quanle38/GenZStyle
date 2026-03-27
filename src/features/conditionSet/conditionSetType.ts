/* =========================
   ENUMS
========================= */
export type CouponConditionType =
    | "MIN_ORDER_VALUE"
    | "TIER"
    | "NEW_USER"
    | "DAY_OF_WEEK"
    | "HOUR_OF_DAY";

/* =========================
   MODELS
========================= */
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
}

export interface ConditionSetWithDetails extends ConditionSet {
    details: ConditionDetail[];
}

/* =========================
   REQUESTS
========================= */
export interface ConditionDetailInput {
    condition_type: CouponConditionType;
    condition_value: string;
}

export interface CreateConditionSetRequest {
    id: string;
    name: string;
    is_reusable: boolean;
    details: ConditionDetailInput[];
}

// Update là Partial của Create nhưng không cần id (id truyền qua URL)
export type UpdateConditionSetRequest = Partial<Omit<CreateConditionSetRequest, "id">>;

/* =========================
   RESPONSES
========================= */
export interface GetAllConditionSetsResponse {
    success: boolean;
    message: string;
    currentPage: number;
    totalPage: number;
    totalConditionSet: number;
    data: ConditionSet[];
}

export interface GetConditionSetByIdResponse {
    success: boolean;
    message: string;
    data: ConditionSetWithDetails;
}

export interface CreateConditionSetResponse {
    success: boolean;
    message: string;
    data: ConditionSetWithDetails;
}

export interface UpdateConditionSetResponse {
    success: boolean;
    message: string;
    data: ConditionSetWithDetails;
}

export interface DeleteConditionSetResponse {
    success: boolean;
    message: string;
}