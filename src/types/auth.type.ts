// 1. Định nghĩa Interface cho dữ liệu Auth
export interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isAuthenticated: boolean;
  logout : () => void;
}