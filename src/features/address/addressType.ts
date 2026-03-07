export interface UserAddress {
    address_id: number;
    user_id: string;
    full_address: string;
    label: string;
    is_default: boolean;
    is_deleted: boolean;
    created_at: string; // ISO string
    updated_at: string; // ISO string
}

export interface GetAllUserAddressResponse {
    success: boolean;
    data: UserAddress[];
}

export interface CreateUserAddressResponse {
    success: boolean;
    message: string;
    data: UserAddress;
}

export interface GetUserAddressDetailResponse {
    success: boolean;
    data: UserAddress;
}

export interface UpdateUserAddressResponse {
    success: boolean;
    data: UserAddress;
}
