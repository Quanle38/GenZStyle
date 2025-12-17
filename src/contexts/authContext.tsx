import { createContext, useState, useMemo, type ReactNode } from "react";
import type { AuthContextType } from "../types/auth.type";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(
  localStorage.getItem("accessToken")
);

const setAccessToken = (token: string | null) => {
  setAccessTokenState(token);

  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};
  const logout = () => {
  setAccessToken(null);
  window.location.reload(); 
};

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      logout,
      isAuthenticated: !!accessToken,
    }),
    [accessToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
