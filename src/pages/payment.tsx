import { useState, useEffect } from "react" // 1. Thêm useEffect
import { useDispatch } from "react-redux" // 2. Thêm useDispatch
import type { AppDispatch } from "../app/store" // 3. Import type (để tránh lỗi verbatimModuleSyntax)
import { getAllCouponByUserThunk } from "../features/coupon/couponSlice" // 4. Import Thunk

import HeaderStep from "../components/headerStep"
import InfoAndCoupon from "../components/infoAndCoupon";
import PaymentSummary from "../components/paymentSumary";

export default function PaymentPage() {
    const dispatch = useDispatch<AppDispatch>(); // Khởi tạo dispatch
    const [active, setActive] = useState(1);
    const MAX_STEP = 3;
    const MIN_STEP = 1;

    // BỔ SUNG: Gọi API lấy coupon ngay khi component mount
    useEffect(() => {
        dispatch(getAllCouponByUserThunk());
    }, [dispatch]);

    const handleNextStep = () => {
        setActive(prev => Math.min(prev + 1, MAX_STEP));
    };

    const handlePrevStep = () => {
        setActive(prev => Math.max(prev - 1, MIN_STEP));
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen px-16">
            <div className="w-[80%] "><HeaderStep active={active} /></div>
            <div className="grid grid-cols-3 gap-8 w-full mt-8">
                {/* LEFT */}
                <div className="col-span-2 w-full">
                    <InfoAndCoupon />
                </div>

                {/* RIGHT */}
                <div className="w-full">
                    <PaymentSummary />
                </div>
            </div>
        </div>
    )
}