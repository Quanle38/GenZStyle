/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../app/store";
import { getAllAddressThunk, createAddressThunk } from "../features/address/addressSlice";
import { applyCouponThunk, removeCouponThunk } from "../features/cartCoupon/cartCouponSlice";
import type { UserAddress } from "../features/address/addressType";
import { useAuth } from "../hooks/useAuth";
export default function InfoAndCoupon() {
  const dispatch = useDispatch<AppDispatch>();

  // --- REDUX ---
  const { list: addressList, loading: addressLoading } = useSelector((s: RootState) => s.address);
  const { userInfo } = useAuth();
  const { couponsByUser, loading: couponLoading } = useSelector((s: RootState) => s.coupon);
  const { appliedCoupons, loading: applyLoading } = useSelector((s: RootState) => s.cartCoupon);

  // --- ADDRESS STATE ---
  const [selectedAddress, setSelectedAddress] = useState<UserAddress | null>(null);
  const [tempAddress, setTempAddress] = useState<UserAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // --- CREATE ADDRESS STATE ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newFullAddress, setNewFullAddress] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [creating, setCreating] = useState(false);

  // --- COUPON STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch addresses
  useEffect(() => {
    dispatch(getAllAddressThunk());
  }, [dispatch]);

  // 2. Auto-select default address
  useEffect(() => {
    if (addressList.length > 0 && !selectedAddress) {
      const def = addressList.find((a) => a.is_default) || addressList[0];
      setSelectedAddress(def);
    }
  }, [addressList, selectedAddress]);

  // 3. Filter coupons dropdown
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

  // 4. Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- HANDLERS ---
  const handleOpenAddressModal = () => {
    setTempAddress(selectedAddress);
    setIsAddressModalOpen(true);
  };

  const handleConfirmAddress = () => {
    if (tempAddress) setSelectedAddress(tempAddress);
    setIsAddressModalOpen(false);
  };

  const handleApplyCoupon = async () => {
    if (!searchTerm.trim()) return;

    // Giới hạn tối đa 2 coupon
    if (appliedCoupons.length >= 2) {
      toast.error("Chỉ được áp dụng tối đa 2 coupon!");
      return;
    }

    const alreadyApplied = appliedCoupons.some(
      (c) => c.coupon_id === couponsByUser.find((x) => x.code === searchTerm)?.id
    );
    if (alreadyApplied) {
      toast.error("Coupon này đã được áp dụng!");
      return;
    }

    try {
      const result = await dispatch(applyCouponThunk({ coupon_code: searchTerm })).unwrap();
      toast.success(result.message || "Áp dụng coupon thành công!");
      setSearchTerm("");
    } catch (err: any) {
      toast.error(err || "Áp dụng coupon thất bại!");
    }
  };

  const handleRemoveCoupon = async (couponId: string) => {
    try {
      await dispatch(removeCouponThunk(couponId)).unwrap();
      toast.success("Đã xóa coupon!");
    } catch {
      toast.error("Xóa coupon thất bại!");
    }
  };

  const handleCreateAddress = async () => {
    if (!newLabel.trim() || !newFullAddress.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    setCreating(true);
    try {
      await dispatch(createAddressThunk({
        label: newLabel,
        full_address: newFullAddress,
        is_default: newIsDefault,
      })).unwrap();
      toast.success("Thêm địa chỉ thành công!");
      setIsCreateModalOpen(false);
      setNewLabel("");
      setNewFullAddress("");
      setNewIsDefault(false);
    } catch {
      toast.error("Thêm địa chỉ thất bại!");
    } finally {
      setCreating(false);
    }
  };

  // Join appliedCoupons với couponsByUser để lấy code
  const appliedCouponDetails = appliedCoupons.map((ac) => {
    const found = couponsByUser.find((c) => c.id === ac.coupon_id);
    return { ...ac, code: found?.code || ac.coupon_id };
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-8 space-y-8 shadow-sm">

      {/* SHIPPING INFO */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            className="col-span-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            placeholder="Full name"
          value={userInfo ? `${userInfo.first_name} ${userInfo.last_name}` : ""}
            readOnly
          />
          <input
            className="col-span-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
            placeholder="Phone number"
           value={userInfo?.phone_number || ""}
            readOnly
          />

          {/* ADDRESS DISPLAY */}
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
                  {selectedAddress?.is_default && (
                    <span className="text-black border border-black text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate italic">
                  {addressLoading ? "Loading..." : selectedAddress?.full_address || "No address selected"}
                </p>
              </div>
              <button
                onClick={handleOpenAddressModal}
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
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="text-lg font-semibold text-gray-900">Coupon</h3>
          {appliedCouponDetails.map((ac) => (
            <span
              key={ac.id}
              className="group flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3 py-1 rounded-full"
            >
              {ac.code}
              <button
                onClick={() => handleRemoveCoupon(ac.coupon_id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red-400"
                title="Xóa coupon"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-3 items-start">
          <div className="relative flex-1">
            <input
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all"
              placeholder={couponLoading ? "Checking..." : "Enter coupon code"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
            />

            {isDropdownOpen && filteredCoupons.length > 0 && (
              <ul className="absolute z-40 mt-2 w-full max-h-64 overflow-y-auto rounded-lg bg-white border border-gray-200 shadow-2xl py-2">
                {filteredCoupons.map((coupon) => (
                  <li
                    key={coupon.id}
                    onClick={() => { setSearchTerm(coupon.code); setIsDropdownOpen(false); }}
                    className="cursor-pointer px-4 py-3 flex flex-col gap-1 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">{coupon.code}</span>
                      <span className="text-sm font-medium text-black">
                        {coupon.type === "PERCENT" ? `-${coupon.value}%` : `-${Number(coupon.value).toLocaleString()}đ`}
                      </span>
                    </div>
                    {coupon.conditionSet?.name && (
                      <p className="text-xs text-gray-600">{coupon.conditionSet.name}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                        HSD: {new Date(coupon.end_time).toLocaleDateString("vi-VN")}
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
            disabled={applyLoading || !searchTerm.trim()}
            className="rounded-md bg-black text-white px-8 py-3 text-sm font-medium hover:bg-zinc-800 disabled:bg-gray-300 h-[46px] transition-all"
          >
            {applyLoading ? "..." : "Apply"}
          </button>
        </div>
      </div>

      {/* ===== ADDRESS MODAL ===== */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">My Addresses</span>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto">
              {addressList.length > 0 ? addressList.map((addr) => (
                <div
                  key={addr.address_id}
                  onClick={() => setTempAddress(addr)}
                  className="flex gap-4 items-start pb-6 mb-6 border-b border-gray-50 last:border-0 last:pb-0 last:mb-0 cursor-pointer"
                >
                  <div className="mt-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${tempAddress?.address_id === addr.address_id ? "border-black bg-black" : "border-gray-300"}`}>
                      {tempAddress?.address_id === addr.address_id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">{addr.label}</span>
                      <button className="text-black text-[13px] font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Update</button>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm leading-relaxed truncate ${tempAddress?.address_id === addr.address_id ? "text-black font-medium" : "text-gray-500"}`}>
                        {addr.full_address}
                      </p>
                      {addr.is_default && (
                        <span className="text-black border border-black text-[9px] px-2 py-0.5 rounded font-bold uppercase shrink-0">Default</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-500">No addresses available.</div>
              )}
            </div>

            <div className="p-6 bg-gray-50/50 flex flex-col gap-4">
              <button
                onClick={() => { setIsAddressModalOpen(false); setIsCreateModalOpen(true); }}
                className="w-full border border-dashed border-gray-300 py-3 rounded-md text-gray-600 hover:border-black hover:text-black transition-all text-sm font-medium"
              >
                + Add New Address
              </button>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsAddressModalOpen(false)} className="px-8 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-white transition-all">Cancel</button>
                <button onClick={handleConfirmAddress} className="px-10 py-2.5 bg-black text-white rounded-md text-sm font-medium hover:bg-zinc-800 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE ADDRESS MODAL ===== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Add New Address</span>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-black">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Label <span className="text-gray-400 font-normal">(e.g., Nhà riêng, Công ty...)</span>
                </label>
                <input
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all"
                  placeholder="Enter label name"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-black outline-none transition-all resize-none"
                  placeholder="Enter detailed address"
                  rows={3}
                  value={newFullAddress}
                  onChange={(e) => setNewFullAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                <button
                  type="button"
                  onClick={() => setNewIsDefault(!newIsDefault)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${newIsDefault ? "bg-indigo-600" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${newIsDefault ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAddress}
                disabled={creating}
                className="px-8 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-all"
              >
                {creating ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}