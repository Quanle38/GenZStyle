/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError,  type InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const API_URL = import.meta.env.VITE_API_URL || "fallback"
const axiosInstance = axios.create({
    baseURL: API_URL + "/api/v1",
    timeout: 10000,
    withCredentials: true
})

// Định nghĩa kiểu dữ liệu cho yêu cầu gốc (original request)
// Cần thêm thuộc tính _retry để tránh lặp vô hạn
type OriginalRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Định nghĩa kiểu dữ liệu cho hàng đợi bị lỗi (failedQueue)
interface FailedQueueItem {
    resolve: (value: InternalAxiosRequestConfig) => void
    reject: (reason?: any) => void
    originalConfig: OriginalRequestConfig // Lưu cấu hình yêu cầu gốc
}

// Biến cờ để ngăn chặn nhiều yêu cầu Refresh Token cùng lúc
let isRefreshing = false
// Hàng đợi cho các yêu cầu API bị lỗi 401 đang chờ Refresh Token mới
let failedQueue: FailedQueueItem[] = []

/**
 * Hàm xử lý hàng đợi bị lỗi 401.
 * Thử lại các yêu cầu với token mới hoặc từ chối nếu refresh thất bại.
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else if (token) {
            // Sử dụng set() method để cập nhật header
            prom.originalConfig.headers.set('Authorization', `Bearer ${token}`)
            // Resolve promise với cấu hình đã được cập nhật
            prom.resolve(prom.originalConfig)
        }
    })
    failedQueue = []
}

/**
 * Hàm giả định gọi API Refresh Token.
 * NOTE: Cần thay thế bằng logic gọi API Refresh Token thực tế của bạn.
 */
const refreshAccessToken = async (refreshToken: string) => {
    try {
        // --- GỌI API THỰC TẾ CỦA BẠN TẠI ĐÂY ---
        // VD: const response = await axiosInstance.post('/auth/refresh-token', { refreshToken })
        
        // Tạm thời mô phỏng:
        const newAccessToken = 'new_access_token_from_api_' + Date.now()
        const newRefreshToken = 'new_refresh_token_from_api_' + Date.now()

        // LƯU TOKEN MỚI VÀO COOKIES (Đảm bảo tên cookie khớp với Redux Slice)
        Cookies.set('access_token', newAccessToken, { expires: 1/24, secure: true }); // VD: 1 giờ
        Cookies.set('refresh_token', newRefreshToken, { expires: 7, secure: true }); // VD: 7 ngày

        return newAccessToken
    } catch (refreshError) {
        // Xóa thông tin đăng nhập nếu refresh thất bại
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        Cookies.remove('user')
        console.error('Refresh token failed. User logged out.')
        // Bạn có thể redirect người dùng ở đây
        // window.location.href = '/login' 
        throw refreshError
    }
}


// ------------------------------------
// --- REQUEST INTERCEPTOR (GẮN TOKEN) ---
// ------------------------------------
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Lấy token từ cookie 'access_token'
        const token = Cookies.get('access_token')

        if (token) {
            // Gán Bearer token vào header
            config.headers.set('Authorization', `Bearer ${token}`)
        }

        return config
    },
    (error: AxiosError) => Promise.reject(error)
)

// ---------------------------------------
// --- RESPONSE INTERCEPTOR (BẮT LỖI 401 & REFRESH) ---
// ---------------------------------------
axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as OriginalRequestConfig
        const status = error.response?.status
        const refreshToken = Cookies.get('refresh_token')

        // 1. Kiểm tra điều kiện Refresh Token
        // Lỗi 401 VÀ chưa phải là yêu cầu thử lại VÀ có Refresh Token
        if (status === 401 && originalRequest && !originalRequest._retry && refreshToken) {
            originalRequest._retry = true // Đánh dấu là đã thử lại 1 lần

            if (isRefreshing) {
                // Nếu đang trong quá trình refresh, thêm yêu cầu vào hàng đợi và chờ
                return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
                    // Lưu cả originalRequest vào hàng đợi
                    failedQueue.push({ 
                        resolve, 
                        reject,
                        originalConfig: originalRequest 
                    })
                })
                .then(updatedConfig => {
                    // Thử lại yêu cầu ban đầu với cấu hình đã được cập nhật
                    return axiosInstance(updatedConfig)
                })
                .catch(err => {
                    return Promise.reject(err)
                })
            }

            isRefreshing = true
            console.warn('Unauthorized (401)! Attempting to refresh token...')

            try {
                // 2. Gọi hàm Refresh Token
                const newAccessToken = await refreshAccessToken(refreshToken)
                
                // 3. Xử lý các yêu cầu đang chờ (hàng đợi) với token mới
                processQueue(null, newAccessToken) 

                // 4. Thử lại yêu cầu ban đầu (originalRequest) với Access Token mới
                originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`)
                return axiosInstance(originalRequest)
            } catch (refreshError: any) {
                // 5. Nếu Refresh thất bại, xóa hàng đợi và từ chối tất cả yêu cầu
                processQueue(refreshError, null)

                console.error('Token refresh failed. User needs to log in again.')
                // NOTE: Nếu bạn dùng Redux, đây là nơi tốt nhất để dispatch action `logout()`
                
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // 6. Xử lý lỗi 401 khi không có Refresh Token hoặc đã thử lại (originalRequest._retry = true)
        if (status === 401) {
            console.warn('Unauthorized! Token expired or missing. No refresh attempt made or refresh failed.')
        }

        return Promise.reject(error)
    }
)

export default axiosInstance