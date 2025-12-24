import { createContext, useState, useMemo, type ReactNode, useEffect } from "react";
import type { AuthContextType } from "../types/auth.type";
import { getToken, removeToken, setToken } from "../utils/cookie";
import { logoutThunk, meThunk } from "../features/auth/authSlice";
import { useAppDispatch } from "../app/hooks";
import type { UserData } from "../features/auth/authTypes";
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<null | string>(null);
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
      } catch (err) {
        console.error("Get user failed", err);
        setUserInfo(null);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setUserInfo(null);
    }
  }, [accessToken]);

  const getUser = async () => {
    try {
      const user = await dispatch(meThunk()).unwrap();
      setUserInfo(user); // ✅ GHI ĐÈ
      return user ?? null;
    } catch {
      setUserInfo(null);
      return null;
    }
  };



  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);

    if (token) {
      setToken(token);
    } else {
      removeToken();
    }
  };
  const logout = async () => {
    await dispatch(logoutThunk())
    setAccessToken(null);
    window.location.reload();
  };

    const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,
      isAuthenticated: !!accessToken,
      logout,
      getUser
    }),
    [accessToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
