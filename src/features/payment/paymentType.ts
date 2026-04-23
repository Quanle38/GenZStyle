export interface CreatePaymentPayload {
  amount: number;
  description: string;
  orderId: string;
}

export interface CreatePaymentResponse {
  orderCode: string;
  createdAt: string;
  description: string;
  status: "pending" | "success" | "failed";
  qrURL: string;
}

export interface PaymentStatusResponse {
  status: string; // "Pending" | "Success" | ...
}