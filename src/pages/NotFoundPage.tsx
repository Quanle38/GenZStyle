// pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleBack = () => {
        if (user?.role === "ADMIN") navigate("/admin");
        else navigate("/");
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 select-none">
            {/* Big 404 */}
            <p className="text-[160px] font-black leading-none tracking-tighter text-black opacity-5 absolute">
                404
            </p>

            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                <h1 className="text-[80px] font-black leading-none tracking-tighter text-black">
                    404
                </h1>

                <div className="w-16 h-[2px] bg-black" />

                <div>
                    <p className="text-base font-semibold uppercase tracking-widest text-gray-800">
                        Page Not Found
                    </p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs">
                        Trang bạn tìm không tồn tại hoặc đã bị xoá.
                    </p>
                </div>

                <button
                    onClick={handleBack}
                    className="mt-2 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-none hover:bg-gray-800 transition-colors"
                >
                    ← Quay về trang chủ
                </button>
            </div>
        </div>
    );
}