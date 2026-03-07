import React, { useEffect } from "react";
import { 
  MdConfirmationNumber, 
  MdAdd, 
  MdDeleteSweep, 
  MdEdit, 
  MdAccessTime,
  MdLayers,
  MdRefresh
} from "react-icons/md";

// --- REDUX IMPORTS (Đã sửa theo chuẩn trang Account của bạn) ---
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../app/store"; // Đường dẫn store của bạn
import { getAllCouponThunk } from "../features/coupon/couponSlice"; // Đường dẫn slice của bạn

export default function CouponManagement() {
  // 1. Sử dụng dispatch theo kiểu AppDispatch
  const dispatch = useDispatch<AppDispatch>();
  
  // 2. Lấy dữ liệu từ RootState
  const { allCoupons, loading, error } = useSelector((state: RootState) => state.coupon);

  // 3. Fetch dữ liệu khi component lần đầu hiển thị
  useEffect(() => {
    dispatch(getAllCouponThunk());
  }, [dispatch]);

  // Hàm helper để format tiền
  const formatCurrency = (value: string | null) => {
    if (!value) return "0";
    const num = parseFloat(value);
    return num >= 1000 ? `${num / 1000}K` : num;
  };

  return (
    <div className="p-8 bg-white min-h-screen font-sans">
      {/* Header Section - GIỮ NGUYÊN THIẾT KẾ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic m-0">
            Coupon <span className="text-gray-200 not-italic">Vault</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4"></div>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={() => dispatch(getAllCouponThunk())}
                className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer"
                disabled={loading}
            >
                <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button className="bg-black text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 hover:bg-gray-800 transition-all cursor-pointer border-none outline-none">
                <MdAdd size={18} />
                Generate New Coupon
            </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wider">
          Error: {error}
        </div>
      )}

      {/* Pure Tailwind Table - GIỮ NGUYÊN THIẾT KẾ */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-sm shadow-sm relative">
        {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Coupons...</span>
            </div>
        )}

        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Coupon Code</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Benefit</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Conditions</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Usage</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allCoupons.length > 0 ? (
              allCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <MdConfirmationNumber size={20} />
                      </div>
                      <div>
                        <span className="block font-black text-black tracking-tight border-b-2 border-dotted border-gray-200 uppercase">
                          {coupon.code}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1 block">
                          ID: {coupon.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-black tracking-tighter leading-none italic">
                        {coupon.type === "PERCENT" 
                          ? `-${parseFloat(coupon.value)}%` 
                          : `-${formatCurrency(coupon.value)}`}
                      </span>
                      {coupon.max_discount && (
                        <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                          Max: {formatCurrency(coupon.max_discount)} VNĐ
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex items-start gap-2 max-w-[200px]">
                      <MdLayers className="text-gray-300 mt-1 shrink-0" />
                      <div>
                        <p className="m-0 text-[11px] font-bold text-gray-700 leading-tight uppercase tracking-tighter">
                          {coupon.conditionSet?.name || "No Conditions"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="w-32">
                      <div className="flex justify-between items-center mb-1 text-[10px] font-black uppercase">
                        <span>Used</span>
                        <span>
                          {coupon.usage_limit > 0 
                            ? Math.round((coupon.used_count / coupon.usage_limit) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                        <div 
                          className="h-full bg-black transition-all duration-1000" 
                          style={{ 
                            width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <p className="m-0 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {coupon.used_count} / {coupon.usage_limit} Limits
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-black hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none">
                        <MdEdit size={16} />
                      </button>
                      <button className="p-2 hover:bg-red-500 hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none text-red-500">
                        <MdDeleteSweep size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No coupons found in vault.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex items-center gap-4 text-gray-400">
        <MdAccessTime size={14} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Dữ liệu được đồng bộ trực tiếp từ hệ thống quản trị
        </span>
      </div>
    </div>
  );
}