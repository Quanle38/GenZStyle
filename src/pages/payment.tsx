import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../app/store";
import { getAllCouponByUserThunk } from "../features/coupon/couponSlice";
import { getAppliedCouponsThunk } from "../features/cartCoupon/cartCouponSlice";
import { meThunk } from "../features/auth/authSlice";
import HeaderStep from "../components/headerStep";
import InfoAndCoupon from "../components/infoAndCoupon";
import PaymentSummary from "../components/paymentSumary";
import {  useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [active] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(meThunk());
    dispatch(getAllCouponByUserThunk());
    dispatch(getAppliedCouponsThunk());
  }, [dispatch]);

  useEffect(() => {
  const orderCode = localStorage.getItem("orderCode");
  if (orderCode) {
    navigate("/payment/qr", { replace: true });
  }
}, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-16">
      <div className="w-[80%]"><HeaderStep active={active} /></div>
      <div className="grid grid-cols-3 gap-8 w-full mt-8">
        <div className="col-span-2 w-full">
          <InfoAndCoupon />
        </div>
        <div className="w-full">
          <PaymentSummary />
        </div>
      </div>
    </div>
  );
}