export interface UserAddress {
  address_id?: number;
  user_id?: string;
  full_address: string;
  is_default: boolean;
  label: string;
}

export interface UpdateRequestBodyUser {
  first_name?: string;
  last_name?: string;
  dob?: Date; 
  phone_number?: string;
  gender?: string;
  file: string | null | File;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone_number: string;
  gender: "MALE" | "FEMALE";
  membership_id: "BRONZE" | "SILVER" | "GOLD";
  avatar: string | null;
  role?: string;
  createdAt?: string; // Thêm trường này để phục vụ logic lọc "Mới nhất"
  addresses?: UserAddress[]; 
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  password?: string; 
  address?: string;
  dob?: string;
  gender?: string;
  phone_number?: string;
}