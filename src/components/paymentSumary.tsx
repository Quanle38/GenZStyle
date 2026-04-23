import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { AppDispatch, RootState } from "../app/store";
import { getCartThunk } from "../features/cart/cartSlice";
import { createOrderThunk } from "../features/order/orderSlice";
import { createPaymentThunk } from "../features/payment/paymentSlice";

export default function PaymentSummary() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { cart, isLoading: cartLoading } = useSelector((s: RootState) => s.cart);
  const { appliedCoupons } = useSelector((s: RootState) => s.cartCoupon);
  const { loading: orderLoading } = useSelector((s: RootState) => s.order);
  const { loading: paymentLoading } = useSelector((s: RootState) => s.payment);

  const isPaying = orderLoading || paymentLoading;

  useEffect(() => {
    dispatch(getCartThunk());
  }, [dispatch, appliedCoupons]);

  const formatVND = (amount: number) =>
    `${Number(amount).toLocaleString("vi-VN")} ₫`;

  const handlePayNow = async () => {
    if (!cart) return;

    try {
      // 1. Tạo order từ cart items
      const orderPayload = {
        cart_id: cart.id,
        method: "BANKING" as const,
        items: cart.items.map((item) => ({
          variant_id: item.variant.id,
          quantity: item.quantity,
          price_per_unit: Number(item.variant.price),
        })),
      };

      const order = await dispatch(createOrderThunk(orderPayload)).unwrap();

      // 2. Tạo payment từ order vừa tạo
      const payment = await dispatch(createPaymentThunk({
        amount: cart.total_after_discount ?? cart.total_price,
        description: `Thanh toan don hang Order-${order.id}`,
        orderId: order.id,
      })).unwrap();

      // 3. Lưu xuống localStorage
      localStorage.removeItem("cartId");
      localStorage.setItem("orderCode", payment.orderCode);
      localStorage.setItem("qrURL", payment.qrURL);

      // 4. Navigate sang trang QR
      navigate("/payment/qr");

    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "Thanh toán thất bại, vui lòng thử lại!";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm">
        <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
          Order summary
        </h4>

        {cartLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">
                {formatVND(cart?.total_price ?? 0)}
              </span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="font-medium text-gray-900">0 ₫</span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span className="text-red-500 font-medium">
                {cart?.discount_amount
                  ? `-${formatVND(cart.discount_amount)}`
                  : "0 ₫"}
              </span>
            </div>

            <div className="mt-3 border-t border-gray-200 pt-4 flex justify-between items-end font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span className="text-xl">
                {formatVND(cart?.total_after_discount ?? cart?.total_price ?? 0)}
              </span>
            </div>

            <button
              onClick={handlePayNow}
              disabled={isPaying || !cart}
              className="mt-6 w-full rounded-xl bg-black py-4 text-base font-bold text-white hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPaying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing...
                </span>
              ) : "Pay now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}