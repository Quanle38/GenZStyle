/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/store";
import { getCouponByCodeThunk } from "../features/coupon/couponSlice";
import { getAllAddressThunk } from "../features/address/addressSlice";
import type { UserAddress } from "../features/address/addressType";

export default function InfoAndCoupon() {
  const dispatch = useDispatch<AppDispatch>();

  // --- DATA FROM REDUX STORE ---
  const { list: addressList, loading: addressLoading } = useSelector((state: RootState) => state.address);
  const { user } = useSelector((state: RootState) => state.user);
  const { couponsByUser, loading: couponLoading } = useSelector((state: RootState) => state.coupon);

  // --- LOCAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);

  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [tempAddress, setTempAddress] = useState<UserAddress | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch danh sách địa chỉ
  useEffect(() => {
    dispatch(getAllAddressThunk());
  }, [dispatch]);

  // 2. Tự động chọn địa chỉ mặc định
  useEffect(() => {
    if (addressList && addressList.length > 0 && !selectedAddress) {
      const defaultAddr = addressList.find((addr) => addr.is_default) || addressList[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addressList, selectedAddress]);

  // 3. Logic lọc Coupon
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCoupons(couponsByUser);
    } else {
      const filtered = couponsByUser.filter((c) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoupons(filtered.length > 0 ? filtered : couponsByUser);
    }
  }, [searchTerm, couponsByUser]);

  // 4. Đóng dropdown coupon khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---
  const handleOpenModal = () => {
    setTempAddress(selectedAddress);
    setIsModalOpen(true);
  };

  const handleConfirmAddress = () => {
    if (tempAddress) setSelectedAddress(tempAddress);
    setIsModalOpen(false);
  };

  const handleApplyCoupon = () => {
    if (searchTerm.trim()) {
      dispatch(getCouponByCodeThunk(searchTerm));
      setIsOpen(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 space-y-8 shadow-sm">

      {/* SHIPPING INFO SECTION */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="col-span-2 rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all"
            placeholder="Full name"
            defaultValue={user ? `${user.first_name} ${user.last_name}` : ""}
          />
          <input
            className="col-span-2 rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all"
            placeholder="Phone number"
            defaultValue={user?.phone_number || ""}
          />

          {/* MAIN ADDRESS DISPLAY */}
          <div className="col-span-2 space-y-3 pt-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>Delivery Address</span>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-5 rounded-md border border-gray-100">
              <div className="flex-1 overflow-hidden pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {selectedAddress?.label || "Home"}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-gray-600 truncate italic">
                    {addressLoading ? "Loading..." : selectedAddress?.full_address}
                  </p>
                  {selectedAddress?.is_default && (
                    <span className="text-black border border-black text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleOpenModal}
                className="text-black font-bold hover:opacity-70 transition-opacity text-sm uppercase underline underline-offset-4 shrink-0"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* COUPON SECTION */}
      <div className="relative" ref={dropdownRef}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon</h3>
        <div className="flex gap-3 items-start">
          <div className="relative flex-1">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all"
              placeholder={couponLoading ? "Checking..." : "Enter coupon code"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsOpen(true)}
            />

            {isOpen && filteredCoupons.length > 0 && (
              <ul className="absolute z-40 mt-2 w-full max-h-64 overflow-y-auto rounded-lg bg-white border border-gray-200 shadow-2xl py-2">
                {filteredCoupons.map((coupon) => (
                  <li
                    key={coupon.id}
                    onClick={() => {
                      setSearchTerm(coupon.code);
                      setIsOpen(false);
                    }}
                    className="cursor-pointer px-4 py-3 flex flex-col gap-1 border-bottom border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                      <span className="text-sm font-medium text-black">
                        {coupon.type === "PERCENT"
                          ? `-${coupon.value}%`
                          : `-${Number(coupon.value).toLocaleString()}đ`}
                      </span>
                    </div>

                    {/* Hiển thị tên điều kiện từ data */}
                    {coupon.conditionSet?.name && (
                      <p className="text-xs text-gray-600 leading-tight">
                        {coupon.conditionSet.name}
                      </p>
                    )}

                    {/* Hiển thị hạn sử dụng */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                        HSD: {new Date(coupon.end_time).toLocaleDateString('vi-VN')}
                      </span>
                      {!coupon.is_valid && (
                        <span className="text-[10px] text-red-500 font-medium">(Không khả dụng)</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleApplyCoupon}
            disabled={couponLoading}
            className="rounded-md bg-black text-white px-8 py-3 text-sm font-medium hover:bg-zinc-800 disabled:bg-gray-400 h-[46px] transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* --- ADDRESS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">My Addresses</span>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body - Checklist */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {addressList.length > 0 ? (
                addressList.map((addr) => (
                  <div
                    key={addr.address_id}
                    className="flex gap-4 items-start pb-6 mb-6 border-b border-gray-50 last:border-0 last:pb-0 last:mb-0 cursor-pointer group"
                    onClick={() => setTempAddress(addr)}
                  >
                    {/* Custom Radio Button */}
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tempAddress?.address_id === addr.address_id ? 'border-black bg-black' : 'border-gray-300'}`}>
                        {tempAddress?.address_id === addr.address_id && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        {/* Label hàng trên */}
                        <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {addr.label}
                        </span>
                        <button className="text-black text-[13px] font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Update</button>
                      </div>

                      <div className="flex items-start justify-between gap-4">
                        {/* Address hàng dưới */}
                        <p className={`text-sm leading-relaxed truncate ${tempAddress?.address_id === addr.address_id ? 'text-black font-medium' : 'text-gray-500'}`}>
                          {addr.full_address}
                        </p>

                        {/* Tag Default ở cuối hàng */}
                        {addr.is_default && (
                          <span className="text-black border border-black text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-gray-500">No addresses available.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50/50 flex flex-col gap-4">
              <button className="w-full border border-dashed border-gray-300 py-3 rounded-md text-gray-600 hover:border-black hover:text-black transition-all text-sm font-medium">
                + Add New Address
              </button>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-white transition-all">Cancel</button>
                <button
                  onClick={handleConfirmAddress}
                  className="px-10 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-zinc-800 shadow-lg shadow-black/10 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}