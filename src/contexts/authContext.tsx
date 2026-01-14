import { createContext, useState, useMemo, type ReactNode, useEffect } from "react";
import type { AuthContextType } from "../types/auth.type";
import { getToken, removeToken, setToken } from "../utils/cookie";
import { logoutThunk, meThunk } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import type { UserData } from "../features/auth/authTypes";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) return;

      setAccessTokenState(token);

      try {
        const user = await dispatch(meThunk()).unwrap();
        setUserInfo(user);
      } catch {
        setUserInfo(null);
        removeToken();
        setAccessTokenState(null);
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!accessToken) {
      setUserInfo(null);
    }
  }, [accessToken]);

  const getUser = async (): Promise<UserData | null> => {
    try {
      const user = await dispatch(meThunk()).unwrap();
      return user ?? null;
    } catch {
      return null;
    }
  };

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
      getUser,
    }),
    [accessToken, userInfo]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};