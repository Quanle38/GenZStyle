/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  MdAdd,
  MdDeleteSweep,
  MdEdit,
  MdAccessTime,
  MdRefresh,
  MdVisibility,
  MdClose,
  MdWarning,
  MdCheckCircle,
  MdInfo,
  MdSearch,
  MdShoppingBag,
  MdCategory,
  MdStorefront,
  MdInventory,
  MdAttachMoney,
  MdColorLens,
  MdStraighten,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../app/store";
import {
  getAllProductThunk,
  getProductByIdThunk,
  createProductThunk,
  updateProductThunk,
  deleteProductThunk,
  clearProduct,
} from "../features/product/productSlice";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  VariantCreateDTO,
} from "../features/product/productTypes";
import { notify } from "../utils/notify";

/* =====================
   TYPES
===================== */
type ModalMode = "create" | "edit" | "detail" | null;

interface VariantFormItem {
  size: string;
  color: string;
  stock: string;
  price: string;
  image: string;
}

interface FormState {
  name: string;
  description: string;
  brand: string;
  category: string;
  variants: VariantFormItem[];
}

const defaultVariant: VariantFormItem = {
  size: "",
  color: "",
  stock: "",
  price: "",
  image: "",
};

const defaultForm: FormState = {
  name: "",
  description: "",
  brand: "",
  category: "",
  variants: [{ ...defaultVariant }],
};

/* =====================
   HELPERS
===================== */
const formatPrice = (price: string | number) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (!num) return "0";
  return num >= 1000 ? `${(num / 1000).toFixed(0)}K` : num.toString();
};

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 border text-sm font-bold bg-white outline-none transition-colors focus:border-black ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-400"
  }`;

/* =====================
   SUB-COMPONENTS
===================== */
const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
        <MdInfo size={12} /> {error}
      </p>
    )}
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}> = ({ label, value, icon, accent }) => (
  <div
    className={`border p-6 flex items-center justify-between ${
      accent ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50"
    }`}
  >
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">{label}</p>
      <p className={`text-2xl font-black tracking-tighter ${accent ? "text-white" : "text-black"}`}>
        {value}
      </p>
    </div>
    <div className={`p-3 ${accent ? "text-white/40" : "text-gray-300"}`}>{icon}</div>
  </div>
);

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <div className="bg-gray-50 p-4">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-black text-black text-sm">{value}</p>
  </div>
);

/* =====================
   DELETE CONFIRM MODAL
===================== */
const DeleteConfirmModal: React.FC<{
  product: Product;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ product, loading, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-md p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="p-4 bg-red-50 rounded-full">
          <MdWarning size={32} className="text-red-500" />
        </div>
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter text-center text-black mb-2">
        Confirm Delete
      </h3>
      <p className="text-center text-gray-500 text-sm mb-6">
        This action <strong className="text-black">cannot be undone</strong>.
        All variants will also be removed.
      </p>
      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <MdShoppingBag size={22} className="text-blue-500 shrink-0" />
        <div>
          <p className="font-black text-black uppercase tracking-tight">{product.name}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            {product.brand} · {product.category}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 border-none outline-none"
        >
          {loading ? "Deleting..." : "Delete Product"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   DETAIL MODAL
===================== */
const DetailModal: React.FC<{
  product: Product;
  loadingDetail: boolean;
  onClose: () => void;
  onEdit: () => void;
}> = ({ product, loadingDetail, onClose, onEdit }) => {
  const minPrice = (product.variants ?? []).length
    ? Math.min(...(product.variants ?? []).map((v) => parseFloat(v.price)))
    : 0;
  const maxPrice = (product.variants ?? []).length
    ? Math.max(...(product.variants ?? []).map((v) => parseFloat(v.price)))
    : 0;
  const totalStock = (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Product Detail</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              ID: {product.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer border-none outline-none"
            >
              <MdEdit size={14} /> Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none"
            >
              <MdClose size={18} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {loadingDetail ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Name + badges */}
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-black leading-tight">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                    {product.brand}
                  </span>
                  <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                    {product.category}
                  </span>
                  <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-green-100 text-green-700">
                    {totalStock} in stock
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <InfoCard
                  icon={<MdAttachMoney size={16} />}
                  label="Price Range"
                  value={minPrice === maxPrice ? `${formatPrice(minPrice)}đ` : `${formatPrice(minPrice)}–${formatPrice(maxPrice)}đ`}
                />
                <InfoCard
                  icon={<MdInventory size={16} />}
                  label="Total Stock"
                  value={`${totalStock} units`}
                />
                <InfoCard
                  icon={<MdCategory size={16} />}
                  label="Variants"
                  value={`${product.variants.length} SKUs`}
                />
              </div>

              {/* Description */}
              {product.description && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Description
                    </p>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </>
              )}

              <div className="h-px bg-gray-100" />

              {/* Variants table */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MdInventory size={16} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Variants ({product.variants.length})
                  </span>
                </div>

                <div className="border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Size</th>
                        <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Color</th>
                        <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Stock</th>
                        <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {product.variants.map((v) => (
                        <tr key={v.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <span className="text-xs font-black text-black bg-gray-100 px-2 py-1">
                              {v.size}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: v.color.toLowerCase() }}
                              />
                              <span className="text-xs font-bold text-gray-600 uppercase">{v.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-black ${v.stock === 0 ? "text-red-500" : v.stock < 10 ? "text-orange-500" : "text-green-600"}`}>
                              {v.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-black text-black">
                              {formatPrice(v.price)}đ
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* =====================
   FORM MODAL
===================== */
const FormModal: React.FC<{
  mode: "create" | "edit";
  initialData: Product | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: ProductCreateRequest | ProductUpdateRequest) => void;
}> = ({ mode, initialData, loading, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initialData) {
      return {
        name: initialData.name,
        description: initialData.description,
        brand: initialData.brand,
        category: initialData.category,
        variants: initialData.variants.map((v) => ({
          size: v.size.toString(),
          color: v.color,
          stock: v.stock.toString(),
          price: v.price,
          image: v.image ?? "",
        })),
      };
    }
    return defaultForm;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (form.variants.length === 0) e._variants = "At least 1 variant is required";
    form.variants.forEach((v, i) => {
      if (!v.size || isNaN(+v.size) || +v.size <= 0) e[`size_${i}`] = "Valid size required";
      if (!v.color.trim()) e[`color_${i}`] = "Color required";
      if (!v.stock || isNaN(+v.stock) || +v.stock < 0) e[`stock_${i}`] = "Valid stock required";
      if (!v.price || isNaN(+v.price) || +v.price <= 0) e[`price_${i}`] = "Valid price required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addVariant = () =>
    setForm((f) => ({ ...f, variants: [...f.variants, { ...defaultVariant }] }));

  const removeVariant = (i: number) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  const updateVariant = (i: number, field: keyof VariantFormItem, value: string) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });

  const handleSubmit = () => {
    if (!validate()) return;
    const variants: VariantCreateDTO[] = form.variants.map((v) => ({
      size: parseInt(v.size),
      color: v.color.trim(),
      stock: parseInt(v.stock),
      price: parseFloat(v.price),
      image: v.image.trim() || null,
    }));

    if (mode === "create") {
      const payload: ProductCreateRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        variants,
      };
      onSubmit(payload);
    } else {
      const payload: ProductUpdateRequest = {
        name: form.name.trim(),
        description: form.description.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        variants,
      };
      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">
              {mode === "create" ? "Add New Product" : "Edit Product"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {mode === "create" ? "Fill in product details and variants" : `Editing: ${initialData?.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none"
          >
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Name */}
          <FormField label="Product Name *" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Air Max 270"
              className={inputCls(!!errors.name)}
            />
          </FormField>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Brand *" error={errors.brand}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MdStorefront size={14} />
                </span>
                <input
                  value={form.brand}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, brand: e.target.value }));
                    setErrors((p) => ({ ...p, brand: "" }));
                  }}
                  placeholder="e.g. Nike"
                  className={`${inputCls(!!errors.brand)} pl-8`}
                />
              </div>
            </FormField>
            <FormField label="Category *" error={errors.category}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MdCategory size={14} />
                </span>
                <input
                  value={form.category}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, category: e.target.value }));
                    setErrors((p) => ({ ...p, category: "" }));
                  }}
                  placeholder="e.g. Running"
                  className={`${inputCls(!!errors.category)} pl-8`}
                />
              </div>
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Product description..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </FormField>

          {/* =====================
              VARIANTS SECTION
          ===================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdInventory size={14} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Variants *
                </span>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-black hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                <MdAdd size={14} /> Add Variant
              </button>
            </div>

            {errors._variants && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <MdInfo size={12} /> {errors._variants}
              </p>
            )}

            {form.variants.map((variant, i) => (
              <div key={i} className="border border-dashed border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Variant {i + 1}
                  </span>
                  {form.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      <MdDeleteSweep size={16} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Size */}
                  <FormField label="Size *" error={errors[`size_${i}`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdStraighten size={14} />
                      </span>
                      <input
                        type="number"
                        value={variant.size}
                        onChange={(e) => {
                          updateVariant(i, "size", e.target.value);
                          setErrors((p) => ({ ...p, [`size_${i}`]: "" }));
                        }}
                        placeholder="e.g. 42"
                        className={`${inputCls(!!errors[`size_${i}`])} pl-8`}
                      />
                    </div>
                  </FormField>

                  {/* Color */}
                  <FormField label="Color *" error={errors[`color_${i}`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdColorLens size={14} />
                      </span>
                      <input
                        value={variant.color}
                        onChange={(e) => {
                          updateVariant(i, "color", e.target.value);
                          setErrors((p) => ({ ...p, [`color_${i}`]: "" }));
                        }}
                        placeholder="e.g. Black"
                        className={`${inputCls(!!errors[`color_${i}`])} pl-8`}
                      />
                    </div>
                  </FormField>

                  {/* Stock */}
                  <FormField label="Stock *" error={errors[`stock_${i}`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdInventory size={14} />
                      </span>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          updateVariant(i, "stock", e.target.value);
                          setErrors((p) => ({ ...p, [`stock_${i}`]: "" }));
                        }}
                        placeholder="e.g. 50"
                        className={`${inputCls(!!errors[`stock_${i}`])} pl-8`}
                      />
                    </div>
                  </FormField>

                  {/* Price */}
                  <FormField label="Price (VND) *" error={errors[`price_${i}`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdAttachMoney size={14} />
                      </span>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => {
                          updateVariant(i, "price", e.target.value);
                          setErrors((p) => ({ ...p, [`price_${i}`]: "" }));
                        }}
                        placeholder="e.g. 1500000"
                        className={`${inputCls(!!errors[`price_${i}`])} pl-8`}
                      />
                    </div>
                  </FormField>
                </div>

                {/* Image URL */}
                <FormField label="Image URL (optional)">
                  <input
                    value={variant.image}
                    onChange={(e) => updateVariant(i, "image", e.target.value)}
                    placeholder="https://..."
                    className={inputCls(false)}
                  />
                </FormField>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 bg-black text-white font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border-none outline-none"
            >
              {loading ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <MdCheckCircle size={14} />
                  {mode === "create" ? "Create Product" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================
   MAIN COMPONENT
===================== */
export default function ProductManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { productList, isLoading, error, totalProduct, currentPage, totalPage } = useSelector(
    (state: RootState) => state.product
  );

  const [modalMode, setModalMode]       = useState<ModalMode>(null);
  const [editTarget, setEditTarget]     = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailTarget, setDetailTarget] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchText, setSearchText]     = useState("");

  /* ---- FILTERED LIST ---- */
  const filtered = useMemo(() => {
    if (!searchText) return productList;
    const q = searchText.toLowerCase();
    return productList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [productList, searchText]);

  /* ---- EFFECTS ---- */
  useEffect(() => {
    dispatch(getAllProductThunk());
  }, [dispatch]);

  /* ---- HANDLERS ---- */
  const handleOpenCreate = () => {
    dispatch(clearProduct());
    setEditTarget(null);
    setModalMode("create");
  };

  const handleOpenEdit = (product: Product) => {
    setEditTarget(product);
    setDetailTarget(null);
    setModalMode("edit");
  };

  const handleOpenDetail = async (product: Product) => {
    setDetailTarget(product);
    setLoadingDetail(true);
    setModalMode("detail");
    const result = await dispatch(getProductByIdThunk(product.id));
    if (getProductByIdThunk.fulfilled.match(result)) {
      setDetailTarget(result.payload);
    } else {
      notify.error("Failed to load product details");
    }
    setLoadingDetail(false);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setDetailTarget(null);
    dispatch(clearProduct());
  };

  const handleCreate = async (data: ProductCreateRequest | ProductUpdateRequest) => {
    const result = await dispatch(createProductThunk(data as ProductCreateRequest));
    if (createProductThunk.fulfilled.match(result)) {
      notify.success(`"${result.payload.name}" created successfully!`);
      handleCloseModal();
    } else {
      notify.error(`Failed to create product: ${result.payload}`);
    }
  };

  const handleUpdate = async (data: ProductCreateRequest | ProductUpdateRequest) => {
    if (!editTarget) return;
    const result = await dispatch(
      updateProductThunk({ id: editTarget.id, body: data as ProductUpdateRequest })
    );
    if (updateProductThunk.fulfilled.match(result)) {
      notify.success(`"${result.payload.name}" updated successfully!`);
      handleCloseModal();
    } else {
      notify.error(`Failed to update product: ${result.payload}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteProductThunk(deleteTarget.id));
    if (deleteProductThunk.fulfilled.match(result)) {
      notify.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } else {
      notify.error(`Failed to delete product: ${result.payload}`);
    }
  };

  const handleRefresh = async () => {
    const result = await dispatch(getAllProductThunk());
    if (getAllProductThunk.fulfilled.match(result)) {
      notify.info(`${result.payload.totalProduct} products loaded`);
    } else {
      notify.error("Refresh failed");
    }
  };

  /* ---- RENDER ---- */
  return (
    <div className="p-8 bg-white min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic m-0 text-black">
            Product <span className="not-italic">Drop</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
            className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdRefresh size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-black text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 hover:bg-gray-800 transition-all cursor-pointer border-none outline-none"
          >
            <MdAdd size={18} /> New Product
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Products"
          value={totalProduct.toString()}
          icon={<MdShoppingBag size={22} />}
        />
        <StatCard
          label="Pages"
          value={`${currentPage} / ${totalPage}`}
          icon={<MdCategory size={22} />}
        />
        <StatCard
          label="Showing"
          value={filtered.length.toString()}
          icon={<MdInventory size={22} />}
          accent
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Error: {error}</span>
          <button className="hover:opacity-70 cursor-pointer bg-transparent border-none outline-none">
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, brand, category..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 pr-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors w-80"
          />
        </div>
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="px-4 py-4 border border-black text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
          >
            <MdClose size={14} /> Clear
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-sm shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Loading Products...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Product</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Brand</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Category</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Variants</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Stock</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Price</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((product) => {
                const variants = product.variants ?? [];
                const totalStock = variants.reduce((s, v) => s + v.stock, 0);
                const minPrice = variants.length
                  ? Math.min(...variants.map((v) => parseFloat(v.price)))
                  : 0;
                const maxPrice = variants.length
                  ? Math.max(...variants.map((v) => parseFloat(v.price)))
                  : 0;
                const outOfStock = totalStock === 0;

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-all">
                    {/* PRODUCT */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                          <MdShoppingBag size={18} />
                        </div>
                        <div>
                          <span className="block font-black text-black tracking-tight uppercase text-sm border-b-2 border-dotted border-gray-200">
                            {product.name}
                          </span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1 block">
                            ID: {product.id.toString().slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* BRAND */}
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-black uppercase tracking-tight">
                        {product.brand}
                      </span>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                        {product.category}
                      </span>
                    </td>

                    {/* VARIANTS */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {variants.slice(0, 3).map((v) => (
                          <span
                            key={v.id}
                            className="text-[9px] font-black bg-gray-50 border border-gray-200 px-1.5 py-0.5"
                          >
                            {v.size}
                          </span>
                        ))}
                        {variants.length > 3 && (
                          <span className="text-[9px] font-black text-gray-400">
                            +{variants.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* STOCK */}
                    <td className="px-6 py-5">
                      <span
                        className={`text-xs font-black ${
                          outOfStock ? "text-red-500" : totalStock < 20 ? "text-orange-500" : "text-green-600"
                        }`}
                      >
                        {outOfStock ? "OUT" : totalStock}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-black italic tracking-tighter">
                        {minPrice === maxPrice
                          ? `${formatPrice(minPrice)}đ`
                          : `${formatPrice(minPrice)}–${formatPrice(maxPrice)}đ`}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(product)}
                          title="View"
                          className="p-2 bg-black text-white hover:bg-gray-700 transition-colors cursor-pointer outline-none border-none"
                        >
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          title="Edit"
                          className="p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer outline-none border-none"
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          title="Delete"
                          className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer outline-none border-none"
                        >
                          <MdDeleteSweep size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              !isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                  >
                    No products found.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="mt-8 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-4">
          <MdAccessTime size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Data synced directly from the admin system
          </span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">
          {filtered.length} / {totalProduct} products
        </span>
      </div>

      {/* ===== MODALS ===== */}

      {modalMode === "detail" && detailTarget && (
        <DetailModal
          product={detailTarget}
          loadingDetail={loadingDetail}
          onClose={handleCloseModal}
          onEdit={() => handleOpenEdit(detailTarget)}
        />
      )}

      {modalMode === "create" && (
        <FormModal
          mode="create"
          initialData={null}
          loading={isLoading}
          onClose={handleCloseModal}
          onSubmit={handleCreate}
        />
      )}

      {modalMode === "edit" && editTarget && (
        <FormModal
          mode="edit"
          initialData={editTarget}
          loading={isLoading}
          onClose={handleCloseModal}
          onSubmit={handleUpdate}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          loading={isLoading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}