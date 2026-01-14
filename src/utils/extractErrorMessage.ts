import type { AxiosError } from "axios";

export const extractErrorMessage = (error: unknown): { message: string; status: number } => {
    const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
        errors?: string[];
        detail?: string;
    }>;

    let message = "Request failed";
    const status = axiosError.response?.status || 500;

    const data = axiosError.response?.data;

    if (data) {
        message =
            data.message ||
            data.error ||
            data.errors?.join(", ") ||
            data.detail ||
            axiosError.message ||
            message;
    } else {
        message = axiosError.message || message;
    }

    return { message, status };
};