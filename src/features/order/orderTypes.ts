/* =========================
   ENUMS
========================= */
export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "completed";

export type OrderMethod = "CAST" | "BANKING" | "MOMO" | "ZALOPAY";

/* =========================
   MODELS
========================= */
export interface OrderItem {
    id: number;
    order_id: string;
    variant_id: string;
    quantity: number;
    price_per_unit: number;
    variant?: {
        id: string;
        name?: string;
        sku?: string;
        image_url?: string;
        product?: {
            id: string;
            name: string;
        };
    };
}

export interface Order {
    id: string;
    user_id: string;
    cart_id: string | null;
    quantity: number;
    total_price: number;
    status: OrderStatus;
    method: OrderMethod;
    created_at: string;
    updated_at: string;
    orderItems?: OrderItem[];
}

export interface OrderStatistics {
    totalOrders: number;
    totalSpent: number;
    ordersByStatus: Record<string, number>;
}

/* =========================
   REQUESTS
========================= */
export interface CreateOrderRequest {
    cart_id?: string | null;
    method: OrderMethod;
    items: Array<{
        variant_id: string;
        quantity: number;
        price_per_unit: number;
    }>;
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

/* =========================
   RESPONSES
========================= */
export interface GetAllOrdersResponse {
    success: boolean;
    data: Order[];
}

export interface GetOrderByIdResponse {
    success: boolean;
    data: Order;
}

export interface GetOrderItemsResponse {
    success: boolean;
    data: OrderItem[];
}

export interface GetOrderStatisticsResponse {
    success: boolean;
    data: OrderStatistics;
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: Order;
}

export interface UpdateOrderStatusResponse {
    success: boolean;
    message: string;
    data: Order;
}

export interface DeleteOrderResponse {
    success: boolean;
    message: string;
}