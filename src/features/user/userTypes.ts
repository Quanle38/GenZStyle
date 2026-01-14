export interface UpdateRequestBodyUser {
    first_name?: string;
    last_name?: string;
    dob?: Date; 
    phone_number?: string;
    gender?: string;
    avatar? : string;
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
}

