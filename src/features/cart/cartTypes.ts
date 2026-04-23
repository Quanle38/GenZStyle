// cart.types.ts

/* =======================
   RESPONSE CHUNG
======================= */
export type CartResponse = {
    success: boolean;
    message: string;
    data: Cart;
};

/* =======================
   CART
======================= */
export type Cart = {
    id: string;                     // "C002"
    user_id: string;                // "U002"
    amount: number;                 // 1
    total_price: number;            // 2800000

    items: CartItem[];

    // thêm mới:
    cartCoupons: CartCoupon[];      // danh sách coupon đang áp dụng vào cart
    discount_amount: number;        // 60000
    total_after_discount: number;   // 2740000
    coupon_details: CouponDetail[]; // [{ code, type, discount }]
};

/* =======================
   CART ITEM
======================= */
export type CartItem = {
    id: string;
    quantity: number;
    total_price: string;
    product_name: string;

    // variant được chọn
    variant: ProductVariant;

    // danh sách variant của product
    variants: ProductVariant[];
};

/* =======================
   PRODUCT VARIANT
======================= */
export type ProductVariant = {
    id: string;
    product_id: string;
    size: number;
    color: string;
    price: string;
    stock: number;
    image: string;
};

/* =======================
   REQUEST
======================= */
export type RequestAddItem = {
    variant_id: string;
    quantity: number;
};


/* =======================
   RESPONSE KHÁC
======================= */
export type RemoveItemResponse = {
    success: boolean;
    message: string;
};
/* =======================
   REQUEST UPDATE ITEM
======================= */
export type RequestUpdateCartItem = {
    variantId?: string;
    quantity?: number;
};

/* =======================
   RESPONSE UPDATE ITEM
======================= */
export type UpdateCartItemResponse = {
    success: boolean;
    message: string;
    data: Cart;
};


export type CouponDetail = {
    code: string;
    type: "PERCENT" | "FIXED";
    discount: number;
};

export type Coupon = {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: string;
    max_discount: string | null;
    start_time: string;
    end_time: string;
};

export type CartCoupon = {
    id: number;
    cart_id: string;
    coupon_id: string;
    applied_at: string;
    coupon: Coupon;
};