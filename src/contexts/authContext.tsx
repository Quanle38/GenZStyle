import { createContext, useState, useMemo, type ReactNode, useEffect } from "react";
import type { AuthContextType } from "../types/auth.type";
import { getToken, removeToken, setToken } from "../utils/cookie";
import { logoutThunk, meThunk } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import type { UserData } from "../features/auth/authTypes";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(getToken());
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const dispatch = useAppDispatch();


  useEffect(() => {
    if (!accessToken) {
      setUserInfo(null);
      return;
    }

    const fetchMe = async () => {
      try {
        const user = await dispatch(meThunk()).unwrap();
        setUserInfo(user);
      } catch {
        setUserInfo(null);
        removeToken();
        setAccessTokenState(null);
      }
    };

    fetchMe();
  }, [accessToken, dispatch]);

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    if (token) setToken(token);
    else removeToken();
  };

  const logout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      
    } finally {
      setAccessToken(null);
      window.location.reload();
    }
  };

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      isAuthenticated: !!accessToken,
      userInfo,
      logout,
    }),
    [accessToken, userInfo]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};