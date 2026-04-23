import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { getPaymentStatusThunk } from "../features/payment/paymentSlice";
import { useOrderTimer } from "../hooks/useOrderTimer";

const POLL_INTERVAL = 3000;

export default function QRPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const orderCode = localStorage.getItem("orderCode");
    const qrURL = localStorage.getItem("qrURL");

    const [status, setStatus] = useState<string | null>(null);
    const [showExpiredPopup, setShowExpiredPopup] = useState(false);

    // ✅ Thay thế toàn bộ countdown + cleanup bằng hook
    const { secondLeft, clearOrderFromFireBase } = useOrderTimer(
        orderCode,
        () => setShowExpiredPopup(true)   // onExpired callback
    );

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Poll payment status
    useEffect(() => {
        if (!orderCode) {
            navigate("/");
            return;
        }

        const poll = async () => {
            try {
                const result = await dispatch(getPaymentStatusThunk(orderCode)).unwrap();
                setStatus(result.status);
                if (result.status === "Completed") {
                    clearInterval(intervalRef.current!);
                    navigate("/payment/success");
                }
            } catch (err) {
                console.error("Poll error:", err);
            }
        };

        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL);
        return () => clearInterval(intervalRef.current!);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderCode]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, "0");
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 flex flex-col items-center gap-6">

                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Scan to Pay</h1>
                    <p className="text-sm text-gray-400 mt-1">Quét mã QR để hoàn tất thanh toán</p>
                </div>

                {/* QR Code */}
                <div className="relative">
                    {qrURL ? (
                        <div className="rounded-xl overflow-hidden border-4 border-gray-100 shadow-inner">
                            <img src={qrURL} alt="QR Code" className="w-56 h-56 object-contain" />
                        </div>
                    ) : (
                        <div className="w-56 h-56 bg-gray-100 rounded-xl animate-pulse" />
                    )}
                    <span className="absolute -top-2 -right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500" />
                    </span>
                </div>


                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-gray-500 font-medium">
                        {status ?? "Waiting for payment..."}
                    </span>
                </div>

                {/* Countdown — ✅ dùng secondLeft từ hook */}
                <div className="text-center">
                    <p className="text-xs text-gray-400">Mã QR hết hạn sau</p>
                    <p className={`text-3xl font-black tabular-nums mt-1 ${secondLeft <= 60 ? "text-red-500 animate-pulse" : "text-gray-900"}`}>
                        {formatTime(secondLeft)}
                    </p>
                </div>

                {/* Cancel — ✅ xoá Firebase qua hook */}
                <button
                    onClick={async () => {
                        if (orderCode) await clearOrderFromFireBase(orderCode);
                        clearInterval(intervalRef.current!);
                        navigate("/payment");
                    }}
                    className="w-full border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    Huỷ thanh toán
                </button>
            </div>

            {/* ===== EXPIRED POPUP ===== */}
            {showExpiredPopup && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-8 flex flex-col items-center gap-5 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-gray-900">Phiên thanh toán hết hạn</h2>
                            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                                Mã QR đã hết hiệu lực sau 10 phút. <br />
                                Vui lòng thực hiện lại giao dịch.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <button
                                onClick={() => navigate("/payment")}
                                className="w-full rounded-xl bg-black py-3 text-sm font-bold text-white hover:bg-gray-800 transition-all"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}