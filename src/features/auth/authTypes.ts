export interface LoginRequest {
    email: string;
    password: string;
}

export interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    dob: string;
    phone_number: string;
    gender: "MALE" | "FEMALE";
    is_new: boolean;
    role: "USER" | "ADMIN" | string;
    avatar: string | null;
    created_at: string;
    updated_at: string;
    membership_id: string;
}

export interface AuthData {
    access_token: string;
    refresh_token: string;
    user: UserData;
}

export interface RefreshResponse {
    access_token: string;
    refresh_token: string;
}

export interface DataResponse<T> {
    message: string;
    data: T;
}
