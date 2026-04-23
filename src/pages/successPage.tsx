import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();

  // Xóa localStorage sau khi thanh toán thành công
  useEffect(() => {
    localStorage.removeItem("orderCode");
    localStorage.removeItem("qrURL");
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center">

        {/* Checkmark animation */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center">
            <svg
              className="w-14 h-14 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
                className="animate-[dash_0.6s_ease-in-out_forwards]"
              />
            </svg>
          </div>
          {/* Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-30" />
        </div>

        {/* Text */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Đơn hàng của bạn đã được xác nhận. <br />
            Cảm ơn bạn đã mua hàng!
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100" />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate("/order-history")}
            className="w-full rounded-xl bg-black py-4 text-sm font-bold text-white hover:bg-gray-800 transition-all active:scale-[0.98]"
          >
            View Order History
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="w-full rounded-xl border border-gray-200 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}