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
    id: number;
    user_id: string;
    amount: number;
    total_price: string;
    items: CartItem[];
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
