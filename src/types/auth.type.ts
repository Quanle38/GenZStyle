import type { UserData } from "../features/auth/authTypes";

export interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  getUser: () => Promise<UserData | null>;
}
