import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getProductByIdThunk } from "../features/product/productSlice";
import { addCartItemThunk } from "../features/cart/cartSlice";
import type { ProductVariant } from "../features/product/productTypes";
import "../assets/scss/layout.scss";

// Layout Components
import Footer from "../components/layouts/footer";
import HeaderProduct from "../components/headerProduct";
import priceFormat from "../utils/priceFormat";
import { useAuth } from "../hooks/useAuth";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const { product, isLoading: loading, error } = useAppSelector(
    (state) => state.product
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    if (id) dispatch(getProductByIdThunk(id));
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  /* ================= VARIANT ================= */
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  const imageVariant: ProductVariant | undefined = useMemo(() => {
    if (!product || !selectedColor) return undefined;
    return product.variants.find((v) => v.color === selectedColor);
  }, [product, selectedColor]);

  /* ================= DEFAULT COLOR / SIZE ================= */
  useEffect(() => {
    if (!product || product.variants.length === 0) return;

    const colors = Array.from(
      new Set(product.variants.map((v) => v.color))
    );

    const defaultColor = colors[0];
    const sizes = product.variants
      .filter((v) => v.color === defaultColor)
      .map((v) => v.size)
      .sort((a, b) => a - b);

    setSelectedColor(defaultColor);
    setSelectedSize(sizes[0] ?? null);
    setQuantity(1);
  }, [product]);

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);

    const sizes = product?.variants
      .filter((v) => v.color === color)
      .map((v) => v.size)
      .sort((a, b) => a - b);

    setSelectedSize(sizes?.[0] ?? null);
    setQuantity(1);
  };

  /* ================= COLORS & SIZES ================= */
  const colors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variants.map((v) => v.color)));
  }, [product]);

  const sizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size);
  }, [product, selectedColor]);

  /* ================= ADD TO CART LOGIC ================= */
  const isOutOfStock = selectedVariant?.stock === 0;
  const isOverStock =
    selectedVariant && quantity > selectedVariant.stock;

  const isDisabled =
    !selectedVariant || isOutOfStock || isOverStock;

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (quantity > selectedVariant.stock) return;

    dispatch(
      addCartItemThunk({
        variant_id: selectedVariant.id,
        quantity,
      })
    );

    alert("Đã thêm vào giỏ hàng!");
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <HeaderProduct />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <HeaderProduct />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <p className="text-black text-sm uppercase tracking-widest mb-4">
            {error || "Sản phẩm không tồn tại"}
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="border border-black px-8 py-3 text-[10px] tracking-widest hover:bg-black hover:text-white transition-all uppercase"
          >
            Back to Shop
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <HeaderProduct />

      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* IMAGE */}
            <div className="lg:w-7/12">
              <div className="bg-[#fcfcfc] aspect-[4/5] flex items-center justify-center border border-gray-100 overflow-hidden relative">
                <img
                  src={imageVariant?.image ?? "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="border border-black px-4 py-2 text-sm">
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* INFO */}
            <div className="lg:w-5/12">
              <p className="text-xs uppercase tracking-widest text-gray-400">
                {product.brand}
              </p>
              <h1 className="text-3xl uppercase mt-1">
                {product.name}
              </h1>
              <p className="text-xl mt-3">
                {priceFormat(Number(selectedVariant?.price))} VNĐ
              </p>

              {/* COLOR */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest mb-2">
                  Color
                </p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      className={`px-4 py-2 border text-xs uppercase ${
                        selectedColor === color
                          ? "bg-black text-white border-black"
                          : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-widest mb-2">
                  Size
                </p>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`w-12 h-12 border ${
                        selectedSize === size
                          ? "bg-black text-white border-black"
                          : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUANTITY */}
              <div className="mt-6 flex justify-between items-center border-b pb-4">
                <div className="flex gap-6 items-center">
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                  >
                    −
                  </button>
                  <span>{quantity}</span>
                  <button
                    disabled={
                      selectedVariant &&
                      quantity >= selectedVariant.stock
                    }
                    onClick={() =>
                      setQuantity((q) =>
                        selectedVariant
                          ? Math.min(
                              q + 1,
                              selectedVariant.stock
                            )
                          : q + 1
                      )
                    }
                    className="disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {selectedVariant && (
                  <span className="text-xs uppercase text-gray-400">
                    Stock: {selectedVariant.stock}
                  </span>
                )}
              </div>

              {isOverStock && (
                <p className="text-sm text-red-500 mt-2">
                  Chỉ còn {selectedVariant?.stock} sản phẩm trong
                  kho
                </p>
              )}

              {/* ADD TO CART */}
              <button
                onClick={handleAddToCart}
                disabled={isDisabled}
                className={`w-full mt-6 py-5 text-xs tracking-widest font-bold transition ${
                  !isDisabled
                    ? "bg-black text-white hover:bg-white hover:text-black border border-black"
                    : "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
                }`}
              >
                {isOutOfStock
                  ? "SOLD OUT"
                  : isOverStock
                  ? "NOT ENOUGH STOCK"
                  : "ADD TO CART"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
