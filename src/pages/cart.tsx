import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { RootState } from "../app/store";
import {
  getCartThunk,
  removeCartItemThunk,
  updateCartItemThunk,
} from "../features/cart/cartSlice";
import type { CartItem, RequestUpdateCartItem } from "../features/cart/cartTypes";
import priceFormat from "../utils/priceFormat";
import { RiDeleteBin7Fill } from "react-icons/ri";
import { setLocal } from "../utils/localStorage";

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state: RootState) => state.cart);

  const items = cart?.items ?? [];

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    dispatch(getCartThunk());
  }, [dispatch]);

  const total = useMemo(() => {
    return items.reduce((acc, i) => acc + Number(i.variant.price) * i.quantity, 0);
  }, [items]);

  const openEditModal = (item: CartItem) => {
    setSelectedItem(item);
    setSelectedColor(item.variant.color);
    setSelectedSize(item.variant.size);
    setSelectedQuantity(item.quantity);
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
    return selectedItem.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [selectedItem, selectedColor, selectedSize]);

  const handleConfirm = async () => {
    if (!selectedItem || !selectedVariant) return;

    const body: RequestUpdateCartItem = {
      variantId: selectedVariant.id,
      quantity: selectedQuantity,
    };

    try {
      await dispatch(
        updateCartItemThunk({
          cartItemId: Number(selectedItem.id),
          body,
        })
      ).unwrap();
      await dispatch(getCartThunk());
      setOpenModal(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handlePay = () => {
    setLocal("cartId")
    navigate("/payment");
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await dispatch(removeCartItemThunk(id)).unwrap();
      await dispatch(getCartThunk()); // 👈 BẮT BUỘC
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-center text-2xl font-semibold">Your Cart</h1>

        <div className="mt-6 rounded-3xl bg-white shadow p-6">
          {items.length === 0 && !isLoading ? (
            <div className="py-10 text-center">
              <p>Your cart is empty 🛒</p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 rounded bg-orange-500 px-4 py-2 text-white"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="-my-6 divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-6">
                    <img
                      src={item.variant.image ?? "/placeholder.png"}
                      className="h-24 w-24 rounded object-cover"
                      alt={item.product_name}
                    />

                    <div className="flex-1">
                      <p className="font-semibold">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {priceFormat(Number(item.variant.price))}
                      </p>

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
                    </div>

                    <button
                      disabled={deletingId === Number(item.id)}
                      onClick={() => handleDelete(Number(item.id))}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-40 self-start p-2"
                    >
                      <RiDeleteBin7Fill size={22} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t pt-6 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-back-600">{priceFormat(total)}</span>
              </div>

              <button onClick={() => handlePay()} className="mt-6 w-full rounded-xl bg-black py-3 text-lg font-bold text-white hover:bg-[var(--banner-price)] transition-colors">
                Place Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* MODAL CẬP NHẬT */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-96 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Update Item</h2>

            <p className="mb-2 text-sm font-medium text-gray-700">Color</p>
            <div className="flex gap-3 mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedColor(c);
                    setSelectedSize(null);
                  }}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${selectedColor === c ? "border-orange-500 scale-110" : "border-transparent"
                    }`}
                  style={{ backgroundColor: c.toLowerCase() }}
                />
              ))}
            </div>

            <p className="mb-2 text-sm font-medium text-gray-700">Size</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {sizes
                .slice()
                .sort((a, b) => a.size - b.size)
                .map((v) => (
                  <button
                    key={v.id}
                    disabled={v.stock === 0}
                    onClick={() => setSelectedSize(v.size)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${selectedSize === v.size
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "hover:bg-gray-50"
                      } disabled:opacity-30`}
                  >
                    {v.size}
                  </button>
                ))}
            </div>

            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                >
                  −
                </button>
                <span className="w-4 text-center font-bold">{selectedQuantity}</span>
                <button
                  onClick={() => setSelectedQuantity((q) => q + 1)}
                  className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="flex-1 rounded-xl border py-2 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
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