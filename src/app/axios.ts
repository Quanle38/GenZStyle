/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken, setRefreshToken } from '../utils/cookie'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const axiosInstance = axios.create({
    baseURL: API_URL + "/api/v1",
    timeout: 60000,
    withCredentials: true
})

type OriginalRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

interface FailedQueueItem {
    resolve: (token: string) => void
    reject: (reason?: any) => void
    originalConfig: OriginalRequestConfig
}

let isRefreshing = false
let failedQueue: FailedQueueItem[] = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

const refreshAccessToken = async (): Promise<string> => {
    try {
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        const newAccessToken = response.data.data.access_token; 
        setRefreshToken(newAccessToken);
        return newAccessToken;
    } catch (refreshError) {
        removeToken();
        window.location.href = '/login';
        throw refreshError;
    }
}

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`)
        } 
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as OriginalRequestConfig
        const status = error.response?.status

        if (status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject, originalConfig: originalRequest });
                })
                .then(token => {
                    originalRequest.headers.set('Authorization', `Bearer ${token}`);
                    return axiosInstance(originalRequest);
                })
                .catch(err => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const token = await refreshAccessToken();
                processQueue(null, token);
                originalRequest.headers.set('Authorization', `Bearer ${token}`);
                return axiosInstance(originalRequest);
            } catch (refreshError: any) {
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance