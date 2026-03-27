/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getToken, removeToken, setToken } from '../utils/cookie'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const axiosInstance = axios.create({
    baseURL: API_URL + "/api/v1",
    timeout: 60000,
    withCredentials: true
})

type OriginalRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false

let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(p => {
        if (error) {
            p.reject(error)
        } else {
            p.resolve(token!)
        }
    })
    failedQueue = []
}

const refreshAccessToken = async (): Promise<string> => {
    try {
        const res = await axios.post(
            `${API_URL}/api/v1/auth/refreshToken`,
            {},
            { withCredentials: true }
        )

        const newToken = res.data.data.access_token
        setToken(newToken)

        return newToken
    } catch (err) {
        removeToken()
        window.location.href = "/login"
        throw err
    }
}

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken()

        if (token) {
            config.headers = config.headers || {}
            config.headers['Authorization'] = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as OriginalRequestConfig

        if (!originalRequest) {
            return Promise.reject(error)
        }

        const status = error.response?.status

        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`
                    return axiosInstance(originalRequest)
                })
            }

            isRefreshing = true

            try {
                const token = await refreshAccessToken()

                processQueue(null, token)

                originalRequest.headers['Authorization'] = `Bearer ${token}`
                return axiosInstance(originalRequest)

            } catch (err) {
                processQueue(err, null)
                return Promise.reject(err)

            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance