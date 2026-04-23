import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { RootState } from "../app/store";
import {
  getCartThunk,
  removeCartItemThunk,
  updateCartItemThunk,
} from "../features/cart/cartSlice";
import { getAllCouponByUserThunk } from "../features/coupon/couponSlice";
import { applyCouponThunk } from "../features/cartCoupon/cartCouponSlice";
import type { CartItem, RequestUpdateCartItem } from "../features/cart/cartTypes";
import type { CouponWithValid } from "../features/coupon/couponType";
import priceFormat from "../utils/priceFormat";
import toast from "react-hot-toast";
import {
  RiDeleteBin7Fill, RiCouponLine, RiArrowDownSLine,
  RiArrowUpSLine, RiCheckLine, RiCloseLine,
} from "react-icons/ri";

/* ─────────────────────────────────────────
   COUPON DROPDOWN
───────────────────────────────────────── */
function CouponDropdown({
  coupons, selectedCoupon, subtotal, onSelect, onClose,
}: {
  coupons: CouponWithValid[];
  selectedCoupon: CouponWithValid | null;
  subtotal: number;
  onSelect: (c: CouponWithValid | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const isEligible = (c: CouponWithValid) => {
    const minDetail = c.conditionSet?.details?.find((d) => d.condition_type === "MIN_ORDER_VALUE");
    if (minDetail) return subtotal >= Number(minDetail.condition_value);
    return c.is_valid;
  };

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 max-h-64 overflow-y-auto"
    >
      <div className="sticky top-0 bg-white rounded-t-2xl px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">Your Vouchers</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
          <RiCloseLine size={16} />
        </button>
      </div>

      {coupons.length === 0 ? (
        <p className="px-4 py-6 text-sm text-center text-gray-400">No vouchers available</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {selectedCoupon && (
            <li>
              <button
                onClick={() => { onSelect(null); onClose(); }}
                className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 flex items-center gap-2"
              >
                <RiCloseLine size={14} /> Remove voucher
              </button>
            </li>
          )}
          {coupons.map((c) => {
            const eligible = isEligible(c);
            const isApplied = selectedCoupon?.code === c.code;
            const minDetail = c.conditionSet?.details?.find((d) => d.condition_type === "MIN_ORDER_VALUE");
            const minOrder = minDetail ? Number(minDetail.condition_value) : 0;
            const label = c.type === "PERCENT"
              ? `Save ${c.value}%${c.max_discount ? ` (max ${priceFormat(c.max_discount)})` : ""}`
              : `Save ${priceFormat(c.value)}`;

            return (
              <li key={c.code}>
                <button
                  disabled={!eligible}
                  onClick={() => { if (eligible) { onSelect(c); onClose(); } }}
                  className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                    eligible ? (isApplied ? "bg-orange-50" : "hover:bg-gray-50") : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className={`mt-1 w-1 h-10 rounded-full shrink-0 ${eligible ? "bg-orange-400" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">{c.code}</span>
                      {isApplied && (
                        <span className="text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded">Applied</span>
                      )}
                    </div>
                    <p className="text-xs text-orange-500 font-medium mt-0.5">{label}</p>
                    {minOrder > 0 && (
                      <p className={`text-[11px] mt-0.5 ${subtotal >= minOrder ? "text-green-500" : "text-gray-400"}`}>
                        {subtotal >= minOrder ? "✓ Eligible" : `Min. order ${priceFormat(minOrder)}`}
                      </p>
                    )}
                  </div>
                  {isApplied && <RiCheckLine size={16} className="text-orange-500 shrink-0 mt-1" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN CART
───────────────────────────────────────── */
export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { cart, isLoading } = useAppSelector((state: RootState) => state.cart);
  const { couponsByUser } = useAppSelector((state: RootState) => state.coupon);

  const items = cart?.items ?? [];

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponWithValid | null>(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  useEffect(() => {
    dispatch(getCartThunk());
    dispatch(getAllCouponByUserThunk());
  }, [dispatch]);

  useEffect(() => {
    setSelectedIds(new Set(items.map((i) => Number(i.id))));
  }, [cart]);

  /* ── derived ── */
  const selectedItems = items.filter((i) => selectedIds.has(Number(i.id)));

  const subtotal = useMemo(
    () => selectedItems.reduce((acc, i) => acc + Number(i.variant.price) * i.quantity, 0),
    [selectedItems]
  );

  const discount = useMemo(() => {
    if (!selectedCoupon) return 0;
    if (selectedCoupon.type === "PERCENT") {
      const raw = (subtotal * Number(selectedCoupon.value)) / 100;
      return selectedCoupon.max_discount ? Math.min(raw, Number(selectedCoupon.max_discount)) : raw;
    }
    return Math.min(Number(selectedCoupon.value), subtotal);
  }, [selectedCoupon, subtotal]);

  const total = subtotal - discount;

  useEffect(() => {
    if (!selectedCoupon) return;
    const minDetail = selectedCoupon.conditionSet?.details?.find(
      (d) => d.condition_type === "MIN_ORDER_VALUE"
    );
    if (minDetail && subtotal < Number(minDetail.condition_value)) setSelectedCoupon(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const firstEligible = useMemo(() =>
    couponsByUser.find((c) => {
      if (!c.is_valid) return false;
      const minDetail = c.conditionSet?.details?.find((d) => d.condition_type === "MIN_ORDER_VALUE");
      return minDetail ? subtotal >= Number(minDetail.condition_value) : true;
    }), [couponsByUser, subtotal]
  );

  /* ── checkbox ── */
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => Number(i.id))));

  const toggleItem = (id: number) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });

  /* ── edit modal ── */
  const openEditModal = (item: CartItem) => {
    setSelectedItem(item);
    setSelectedColor(item.variant.color);
    setSelectedSize(item.variant.size);
    setSelectedQty(item.quantity);
    setOpenModal(true);
  };

  const colors = useMemo(() => {
    if (!selectedItem) return [];
    return Array.from(new Set(selectedItem.variants.map((v) => v.color)));
  }, [selectedItem]);

  const sizes = useMemo(() => {
    if (!selectedItem || !selectedColor) return [];
    return selectedItem.variants.filter((v) => v.color === selectedColor);
  }, [selectedItem, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!selectedItem || !selectedColor || !selectedSize) return null;
    return selectedItem.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
  }, [selectedItem, selectedColor, selectedSize]);

  /* ── handlers ── */
  const handleConfirm = async () => {
    if (!selectedItem || !selectedVariant) return;
    const body: RequestUpdateCartItem = { variantId: selectedVariant.id, quantity: selectedQty };
    try {
      await dispatch(updateCartItemThunk({ cartItemId: Number(selectedItem.id), body })).unwrap();
      await dispatch(getCartThunk());
      setOpenModal(false);
    } catch (e) { console.error("Update failed:", e); }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await dispatch(removeCartItemThunk(id)).unwrap();
      await dispatch(getCartThunk());
      setSelectedIds((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (e) { console.error("Delete failed:", e); }
    finally { setDeletingId(null); }
  };

  const handlePay = async () => {
    if (selectedIds.size === 0) return;
    setIsPlacing(true);
    try {
      if (selectedCoupon) {
        await dispatch(applyCouponThunk({ coupon_code: selectedCoupon.code })).unwrap();
      }
      navigate("/payment");
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "Không thể áp dụng voucher!";
      toast.error(msg);
    } finally {
      setIsPlacing(false);
    }
  };

  /* ── render ── */
  return (
    <div className="min-h-screen bg-gray-100 py-12 pb-28">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-center text-2xl font-semibold">Your Cart</h1>

        <div className="mt-6 rounded-3xl bg-white shadow p-6">
          {items.length === 0 && !isLoading ? (
            <div className="py-10 text-center">
              <p>Your cart is empty 🛒</p>
              <button onClick={() => navigate("/shop")} className="mt-4 rounded bg-orange-500 px-4 py-2 text-white">
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="-my-6 divide-y">
                {items.map((item) => {
                  const itemId = Number(item.id);
                  const isChecked = selectedIds.has(itemId);
                  const isDeleting = deletingId === itemId;

                  return (
                    <li key={item.id} className={`flex gap-4 py-6 transition-opacity ${isChecked ? "opacity-100" : "opacity-50"}`}>
                      <label className="flex items-center self-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(itemId)}
                          className="w-4 h-4 accent-orange-500 cursor-pointer"
                        />
                      </label>

                      <img
                        src={item.variant.image ?? "/placeholder.png"}
                        className="h-24 w-24 rounded object-cover shrink-0"
                        alt={item.product_name}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{item.product_name}</p>
                        <p className="text-sm text-gray-500">{priceFormat(Number(item.variant.price))}</p>

                        <div className="mt-2 flex items-center gap-4">
                          <button
                            onClick={() => openEditModal(item)}
                            className="rounded border px-3 py-1 text-sm flex items-center gap-2 hover:bg-gray-50"
                          >
                            <span
                              className="inline-block h-4 w-4 rounded-full border"
                              style={{ backgroundColor: item.variant.color.toLowerCase() }}
                            />
                            Size {item.variant.size}
                          </button>
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-orange-500">
                          {priceFormat(Number(item.variant.price) * item.quantity)}
                        </p>
                      </div>

                      <button
                        disabled={isDeleting}
                        onClick={() => handleDelete(itemId)}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-40 self-start p-2 shrink-0"
                      >
                        <RiDeleteBin7Fill size={22} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Voucher */}
              <div className="mt-6 border-t pt-4 relative">
                <div className="flex items-center gap-3">
                  <RiCouponLine size={18} className="text-orange-500 shrink-0" />
                  <span className="text-sm font-semibold text-gray-700">Store Voucher</span>

                  {!selectedCoupon && firstEligible && (
                    <span className="text-xs text-orange-500 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                      {firstEligible.type === "PERCENT"
                        ? `Save up to ${firstEligible.value}%`
                        : `Save ${priceFormat(firstEligible.value)}`}
                    </span>
                  )}

                  {selectedCoupon && (
                    <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded flex items-center gap-1">
                      <RiCheckLine size={12} /> {selectedCoupon.code}
                    </span>
                  )}

                  <button
                    onClick={() => setCouponOpen((o) => !o)}
                    className="ml-auto flex items-center gap-1 text-sm text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                  >
                    {selectedCoupon ? "Change Voucher" : "More Vouchers"}
                    {couponOpen ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
                  </button>
                </div>

                {couponOpen && (
                  <CouponDropdown
                    coupons={couponsByUser}
                    selectedCoupon={selectedCoupon}
                    subtotal={subtotal}
                    onSelect={setSelectedCoupon}
                    onClose={() => setCouponOpen(false)}
                  />
                )}
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({selectedIds.size} items)</span>
                  <span>{priceFormat(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-500 font-medium">
                    <span className="flex items-center gap-1"><RiCouponLine size={14} /> Discount</span>
                    <span>−{priceFormat(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span className={discount > 0 ? "text-orange-500" : ""}>{priceFormat(total)}</span>
                </div>

                {discount > 0 && (
                  <p className="text-xs text-green-500 text-right font-medium">
                    🎉 You save {priceFormat(discount)}!
                  </p>
                )}
              </div>

              <button
                onClick={handlePay}
                disabled={selectedIds.size === 0 || isPlacing}
                className="mt-6 w-full rounded-xl bg-black py-3 text-lg font-bold text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPlacing ? "Processing..." : `Place Order (${selectedIds.size})`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <span className="text-sm font-medium select-none">Select All ({items.length})</span>
            </label>

            <div className="flex-1" />

            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">Total ({selectedIds.size} items):</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg font-bold text-orange-500">{priceFormat(total)}</p>
                {discount > 0 && <p className="text-xs text-gray-400 line-through">{priceFormat(subtotal)}</p>}
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={selectedIds.size === 0 || isPlacing}
              className="shrink-0 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPlacing ? "..." : `Place Order (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-96 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Update Item</h2>

            <p className="mb-2 text-sm font-medium text-gray-700">Color</p>
            <div className="flex gap-3 mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => { setSelectedColor(c); setSelectedSize(null); }}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${selectedColor === c ? "border-orange-500 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              ))}
            </div>

            <p className="mb-2 text-sm font-medium text-gray-700">Size</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {sizes.slice().sort((a, b) => a.size - b.size).map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedSize(v.size)}
                  className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                    selectedSize === v.size ? "border-orange-500 bg-orange-50 text-orange-600" : "hover:bg-gray-50"
                  } disabled:opacity-30`}
                >
                  {v.size}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedQty((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-100">−</button>
                <span className="w-4 text-center font-bold">{selectedQty}</span>
                <button onClick={() => setSelectedQty((q) => q + 1)} className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-100">+</button>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpenModal(false)} className="flex-1 rounded-xl border py-2 font-medium hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleConfirm}
                disabled={!selectedVariant || isLoading}
                className="flex-1 rounded-xl bg-orange-500 py-2 font-medium text-white disabled:opacity-50 hover:bg-orange-600"
              >
                {isLoading ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}