import Cookies from "js-cookie";

const ACCESS_TOKEN_EXPIRES = 15 / 1440; // 15 phút
const REFRESH_TOKEN_EXPIRES = 7; // 7 ngày

export const setCookie = (name: string, value: string, expires: number) => {
    Cookies.set(name, value, { 
        expires: expires, 
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });
}

export const getCookie = (name: string) => {
    return Cookies.get(name) || null;
}

export const getToken = () => {
    return Cookies.get("accessToken") || null;
}

export const setToken = (value: string) => {
    Cookies.set("accessToken", value, { 
        expires: ACCESS_TOKEN_EXPIRES, 
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });
}

// Nếu bạn cần lưu Refresh Token ở Client (trong trường hợp Backend không dùng HttpOnly)
export const setRefreshToken = (value: string) => {
    Cookies.set("refreshToken", value, { 
        expires: REFRESH_TOKEN_EXPIRES, 
        path: '/',
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });
}

export const removeToken = () => {
    Cookies.remove("accessToken", { path: '/' });
    Cookies.remove("refreshToken", { path: '/' });
}