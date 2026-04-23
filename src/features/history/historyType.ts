

export interface Variant {
    id: string;
    product_id: string;
    size: number;
    color: string;
    stock: number;
    price: string;
    image: string;
    is_deleted?: boolean;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    order_id: string;
    variant_id: string;
    quantity: number;
    price_per_unit: string;
    variant?: Variant; // Dữ liệu có được sau khi gọi API detail
}

export interface Order {
    id: string;
    user_id: string;
    cart_id: string;
    quantity: number;
    total_price: number;
    status: string;
    method: string;
    created_at: string;
    updated_at: string;
    orderItems: OrderItem[];
}

/* API RESPONSES */
export interface GetMyOrdersResponse {
    message: string;
    data: Order[];
}

export interface GetOrderItemsResponse {
    success: boolean;
    data: OrderItem[];
}