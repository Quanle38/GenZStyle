/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import {
    MdAccessTime,
    MdAdd,
    MdAttachMoney,
    MdCancel,
    MdCheckCircle,
    MdClose,
    MdDeleteSweep,
    MdEdit,
    MdFilterList,
    MdInfo,
    MdInventory,
    MdLocalShipping,
    MdReceipt,
    MdRefresh,
    MdSearch,
    MdShoppingCart,
    MdVisibility,
    MdWarning,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../app/store";
import {
    cancelOrderThunk,
    clearOrderError,
    clearSelectedOrder,
    createOrderThunk,
    deleteOrderThunk,
    getAllOrdersThunk,
    getOrderByIdThunk,
    getOrderItemsThunk,
    getOrderStatisticsThunk,
    getOrdersByDateRangeThunk,
    updateOrderStatusThunk,
} from "../features/order/orderSlice";
import type {
    CreateOrderRequest,
    Order,
    OrderMethod,
    OrderStatus
} from "../features/order/orderTypes";
import { notify } from "../utils/notify";

/* =====================
   TYPES
===================== */
type ModalMode = "create" | "detail" | "update-status" | null;

interface OrderItemFormRow {
  variant_id: string;
  quantity: string;
  price_per_unit: string;
}

interface CreateFormState {
  cart_id: string;
  method: OrderMethod;
  items: OrderItemFormRow[];
}

const defaultCreateForm: CreateFormState = {
  cart_id: "",
  method: "CAST",
  items: [{ variant_id: "", quantity: "1", price_per_unit: "" }],
};

/* =====================
   HELPERS
===================== */
const formatCurrency = (value: number) => {
  if (!value) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const formatDisplayDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending:    { label: "Pending",    bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300" },
  processing: { label: "Processing", bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-300"   },
  shipped:    { label: "Shipped",    bg: "bg-purple-50",  text: "text-purple-700", border: "border-purple-300" },
  delivered:  { label: "Delivered",  bg: "bg-green-50",   text: "text-green-700",  border: "border-green-300"  },
  completed:  { label: "Completed",  bg: "bg-green-100",  text: "text-green-800",  border: "border-green-400"  },
  cancelled:  { label: "Cancelled",  bg: "bg-red-50",     text: "text-red-600",    border: "border-red-300"    },
};

const METHOD_LABELS: Record<OrderMethod, string> = {
  CAST:    "Cash on Delivery",
  BANKING: "Bank Transfer",
  MOMO:    "MoMo",
  ZALOPAY: "ZaloPay",
};

const ALL_STATUSES: OrderStatus[] = [
  "pending", "processing", "shipped", "delivered", "completed", "cancelled",
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status?.toLowerCase().trim() as OrderStatus;
  const cfg = STATUS_CONFIG[normalized] ?? {
    label: status, bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      ● {cfg.label}
    </span>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 border text-sm font-bold bg-white outline-none transition-colors focus:border-black ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-400"
  }`;

/* =====================
   FORM FIELD
===================== */
const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({
  label, error, children,
}) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
    {children}
    {error && (
      <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
        <MdInfo size={12} /> {error}
      </p>
    )}
  </div>
);

/* =====================
   DELETE CONFIRM MODAL
===================== */
interface DeleteConfirmProps {
  order: Order;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ order, onConfirm, onCancel, loading }) => (
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
        This action <strong className="text-black">cannot be undone</strong>. Only cancelled orders can be deleted.
      </p>
      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <MdReceipt size={22} className="text-blue-500 shrink-0" />
        <div>
          <p className="font-black text-black tracking-tight">Order #{order.id}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {formatCurrency(order.total_price)} • <StatusBadge status={order.status} />
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 border-none outline-none"
        >
          {loading ? "Deleting..." : "Delete Order"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   CANCEL CONFIRM MODAL
===================== */
interface CancelConfirmProps {
  order: Order;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const CancelConfirmModal: React.FC<CancelConfirmProps> = ({ order, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-md p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="p-4 bg-orange-50 rounded-full">
          <MdCancel size={32} className="text-orange-500" />
        </div>
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter text-center text-black mb-2">
        Cancel Order
      </h3>
      <p className="text-center text-gray-500 text-sm mb-6">
        Only <strong className="text-black">pending</strong> orders can be cancelled. This cannot be undone.
      </p>
      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <MdReceipt size={22} className="text-orange-400 shrink-0" />
        <div>
          <p className="font-black text-black tracking-tight">Order #{order.id}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {order.quantity} items • {formatCurrency(order.total_price)}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white">
          Keep Order
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-3 bg-orange-500 text-white font-black uppercase text-[11px] tracking-widest hover:bg-orange-600 transition-colors cursor-pointer disabled:opacity-50 border-none outline-none"
        >
          {loading ? "Cancelling..." : "Cancel Order"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   DETAIL MODAL
===================== */
interface DetailModalProps {
  order: Order;
  loadingItems: boolean;
  onClose: () => void;
  onUpdateStatus: () => void;
  onCancel: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ order, loadingItems, onClose, onUpdateStatus, onCancel }) => {
  const canCancel  = order.status === "pending";
  //const canDelete  = order.status === "cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Status stripe */}
        <div className={`h-1.5 w-full ${STATUS_CONFIG[order.status as OrderStatus]?.bg ?? "bg-gray-100"}`} />

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Order Detail</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              #{order.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-colors flex items-center gap-2 cursor-pointer border-none outline-none"
              >
                <MdCancel size={14} /> Cancel
              </button>
            )}
            <button
              onClick={onUpdateStatus}
              className="px-4 py-2 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer border-none outline-none"
            >
              <MdEdit size={14} /> Update Status
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
              <MdClose size={18} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Order summary */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={order.status} />
              </div>
              <span className="text-4xl font-black italic text-black tracking-tighter">
                {formatCurrency(order.total_price)}
              </span>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</p>
              <p className="font-black text-black text-sm">{METHOD_LABELS[order.method as OrderMethod] ?? order.method}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={<MdInventory size={16} />}   label="Total Items"  value={`${order.quantity} items`} />
            <InfoCard icon={<MdLocalShipping size={16} />} label="Method"     value={METHOD_LABELS[order.method as OrderMethod] ?? order.method} />
            <InfoCard icon={<MdAccessTime size={16} />}  label="Placed At"   value={formatDisplayDate(order.created_at)} />
            <InfoCard icon={<MdRefresh size={16} />}     label="Updated At"  value={formatDisplayDate(order.updated_at)} />
          </div>

          {order.cart_id && (
            <div className="bg-gray-50 px-4 py-3 flex items-center gap-2">
              <MdShoppingCart size={14} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cart ID:</span>
              <span className="text-[11px] font-bold text-black">{order.cart_id}</span>
            </div>
          )}

          {/* Order Items */}
          <div className="h-px bg-gray-100" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MdInventory size={16} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Order Items
              </span>
            </div>

            {loadingItems ? (
              // Skeleton while fetching
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-4 flex items-center justify-between animate-pulse">
                    <div className="space-y-2">
                      <div className="h-2 w-24 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-2 w-20 bg-gray-200 rounded ml-auto" />
                      <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : order.orderItems && order.orderItems.length > 0 ? (
              <div className="space-y-2">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {(item.variant as any)?.image && (
                        <img
                          src={(item.variant as any).image}
                          alt=""
                          className="w-12 h-12 object-cover border border-gray-200 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variant</p>
                        <p className="font-black text-black text-sm truncate">{item.variant_id}</p>
                        {item.variant && (
                          <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                            Size {(item.variant as any).size} · {(item.variant as any).color}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {item.quantity} × {formatCurrency(Number(item.price_per_unit))}
                      </p>
                      <p className="font-black text-black text-sm">
                        {formatCurrency(item.quantity * Number(item.price_per_unit))}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-black">
                  <span className="text-[11px] font-black uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black italic text-black">{formatCurrency(order.total_price)}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-gray-200">
                No items found for this order
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-black text-black text-sm">{value}</p>
  </div>
);

/* =====================
   UPDATE STATUS MODAL
===================== */
interface UpdateStatusModalProps {
  order: Order;
  loading: boolean;
  onClose: () => void;
  onSubmit: (status: OrderStatus) => void;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({ order, loading, onClose, onSubmit }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status as OrderStatus);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (selectedStatus === order.status) {
      setError("Please select a different status");
      return;
    }
    onSubmit(selectedStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Update Status</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Order #{order.id}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-gray-50">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current:</span>
            <StatusBadge status={order.status} />
          </div>

          <FormField label="New Status" error={error}>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                const isCurrent  = s === order.status;
                const isSelected = s === selectedStatus;
                return (
                  <button
                    key={s}
                    onClick={() => { setSelectedStatus(s); setError(""); }}
                    disabled={isCurrent}
                    className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-black text-white"
                        : isCurrent
                        ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                        : `${cfg.border} ${cfg.bg} ${cfg.text} hover:border-black`
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedStatus === order.status}
              className="flex-1 py-3.5 bg-black text-white font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border-none outline-none"
            >
              {loading ? <span className="animate-pulse">Saving...</span> : <><MdCheckCircle size={14} /> Save Status</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================
   CREATE ORDER MODAL
===================== */
interface CreateOrderModalProps {
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrderRequest) => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ loading, onClose, onSubmit }) => {
  const [form, setForm] = useState<CreateFormState>(defaultCreateForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.method) e.method = "Select a payment method";
    form.items.forEach((item, i) => {
      if (!item.variant_id.trim()) e[`variant_${i}`] = "Variant ID required";
      if (!item.quantity || +item.quantity < 1) e[`qty_${i}`] = "Min quantity: 1";
      if (!item.price_per_unit || +item.price_per_unit <= 0) e[`price_${i}`] = "Price must be > 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addItem = () =>
    setForm(f => ({ ...f, items: [...f.items, { variant_id: "", quantity: "1", price_per_unit: "" }] }));

  const removeItem = (i: number) =>
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const updateItem = (i: number, field: keyof OrderItemFormRow, value: string) =>
    setForm(f => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: value };
      return { ...f, items };
    });

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: CreateOrderRequest = {
      cart_id: form.cart_id || null,
      method: form.method,
      items: form.items.map(item => ({
        variant_id: item.variant_id.trim(),
        quantity: parseInt(item.quantity),
        price_per_unit: parseFloat(item.price_per_unit),
      })),
    };
    onSubmit(payload);
  };

  const totalPreview = form.items.reduce((sum, item) => {
    const q = parseFloat(item.quantity) || 0;
    const p = parseFloat(item.price_per_unit) || 0;
    return sum + q * p;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Create New Order</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Fill in all required fields
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Method */}
          <FormField label="Payment Method *" error={errors.method}>
            <select
              value={form.method}
              onChange={e => setForm(f => ({ ...f, method: e.target.value as OrderMethod }))}
              className={inputCls(!!errors.method)}
            >
              {(Object.entries(METHOD_LABELS) as [OrderMethod, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </FormField>

          {/* Cart ID (optional) */}
          <FormField label="Cart ID (optional)">
            <input
              value={form.cart_id}
              onChange={e => setForm(f => ({ ...f, cart_id: e.target.value }))}
              placeholder="Leave blank if not from cart"
              className={inputCls(false)}
            />
          </FormField>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Order Items *
              </span>
              <button
                onClick={addItem}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-black hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                <MdAdd size={14} /> Add Item
              </button>
            </div>

            {form.items.map((item, i) => (
              <div key={i} className="border border-dashed border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Item {i + 1}
                  </span>
                  {form.items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      <MdDeleteSweep size={16} />
                    </button>
                  )}
                </div>
                <FormField label="Variant ID" error={errors[`variant_${i}`]}>
                  <input
                    value={item.variant_id}
                    onChange={e => updateItem(i, "variant_id", e.target.value)}
                    placeholder="variant-uuid"
                    className={inputCls(!!errors[`variant_${i}`])}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Quantity" error={errors[`qty_${i}`]}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateItem(i, "quantity", e.target.value)}
                      className={inputCls(!!errors[`qty_${i}`])}
                    />
                  </FormField>
                  <FormField label="Price / Unit (VND)" error={errors[`price_${i}`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <MdAttachMoney size={14} />
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={item.price_per_unit}
                        onChange={e => updateItem(i, "price_per_unit", e.target.value)}
                        placeholder="150000"
                        className={`${inputCls(!!errors[`price_${i}`])} pl-8`}
                      />
                    </div>
                  </FormField>
                </div>
              </div>
            ))}
          </div>

          {/* Total Preview */}
          {totalPreview > 0 && (
            <div className="flex items-center justify-between border-t-2 border-black pt-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
                Estimated Total
              </span>
              <span className="text-xl font-black italic text-black">
                {formatCurrency(totalPreview)}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3.5 border-2 border-black font-black uppercase text-[11px] tracking-widest hover:bg-gray-100 transition-colors cursor-pointer bg-white">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3.5 bg-black text-white font-black uppercase text-[11px] tracking-widest hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 border-none outline-none"
            >
              {loading ? (
                <span className="animate-pulse">Placing Order...</span>
              ) : (
                <><MdCheckCircle size={14} /> Place Order</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================
   STATUS FILTER DROPDOWN
===================== */
interface StatusFilterProps {
  current: string;
  onChange: (v: string) => void;
}

const StatusFilterDropdown: React.FC<StatusFilterProps> = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`px-4 py-4 border border-black text-[11px] font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
          current ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
        }`}
      >
        <MdFilterList size={16} />
        {current ? STATUS_CONFIG[current as OrderStatus]?.label ?? current : "All Status"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-black/10 shadow-xl z-20">
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${!current ? "bg-black text-white hover:bg-gray-800" : ""}`}
            >
              All Status
            </button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${current === s ? "bg-black text-white hover:bg-gray-800" : ""}`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* =====================
   MAIN COMPONENT
===================== */
export default function OrderManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { allOrders, loading, loadingDetail, error, statistics } = useSelector((state: RootState) => state.order);

  const [modalMode,    setModalMode]    = useState<ModalMode>(null);
  const [detailTarget, setDetailTarget] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const [searchText,    setSearchText]    = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [methodFilter,  setMethodFilter]  = useState("");
  const [dateFrom,      setDateFrom]      = useState("");
  const [dateTo,        setDateTo]        = useState("");
  const [dateRangeActive, setDateRangeActive] = useState(false);

  /* ---- EFFECTS ---- */
  useEffect(() => {
    dispatch(getAllOrdersThunk());
    dispatch(getOrderStatisticsThunk());
  }, [dispatch]);

  /* ---- FILTERED LIST ---- */
  const filteredOrders = useMemo(() => {
    let result = Array.isArray(allOrders) ? [...allOrders] : [];
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(o => o.id.toLowerCase().includes(q) || o.user_id.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter(o => o.status === statusFilter);
    if (methodFilter) result = result.filter(o => o.method === methodFilter);
    return result;
  }, [allOrders, searchText, statusFilter, methodFilter]);

  /* ---- STATS ---- */
  const stats = useMemo(() => {
    const total = allOrders.length;
    const revenue = allOrders
      .filter((o: Order) => ["completed", "delivered"].includes(o.status))
      .reduce((s: number, o: Order) => s + o.total_price, 0);
    const pending = allOrders.filter(o => o.status === "pending").length;
    return { total, revenue, pending };
  }, [allOrders]);

  /* ---- HANDLERS ---- */
  const handleOpenDetail = async (order: Order) => {
    setDetailTarget(order);
    setModalMode("detail");

    // Fetch order detail + items in parallel
    const [detailResult, itemsResult] = await Promise.all([
      dispatch(getOrderByIdThunk(order.id)),
      dispatch(getOrderItemsThunk(order.id)),
    ]);

    if (getOrderByIdThunk.fulfilled.match(detailResult)) {
      // Merge items into the order object
      const items = getOrderItemsThunk.fulfilled.match(itemsResult)
        ? itemsResult.payload
        : detailResult.payload.orderItems ?? [];
      setDetailTarget({ ...detailResult.payload, orderItems: items });
    } else {
      notify.error("Failed to load order details");
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setDetailTarget(null);
    dispatch(clearSelectedOrder());
    dispatch(clearOrderError());
  };

  const handleCreate = async (data: CreateOrderRequest) => {
    const result = await dispatch(createOrderThunk(data));
    if (createOrderThunk.fulfilled.match(result)) {
      notify.success(`Order #${result.payload.id} placed successfully!`);
      handleCloseModal();
    } else {
      notify.error(`Failed to place order: ${result.payload}`);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!detailTarget) return;
    const result = await dispatch(updateOrderStatusThunk({ id: detailTarget.id, data: { status } }));
    console.log(result);
    if (updateOrderStatusThunk.fulfilled.match(result)) {
      notify.success(`Order status updated to "${STATUS_CONFIG[status].label}"`);
      setDetailTarget(result.payload);
      setModalMode("detail");
    } else {
      notify.error(`Failed to update status: ${result.payload}`);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    const result = await dispatch(cancelOrderThunk(cancelTarget.id));
    if (cancelOrderThunk.fulfilled.match(result)) {
      notify.success(`Order #${cancelTarget.id} has been cancelled`);
      setCancelTarget(null);
      if (detailTarget?.id === cancelTarget.id) setDetailTarget(result.payload);
    } else {
      notify.error(`Failed to cancel order: ${result.payload}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteOrderThunk(deleteTarget.id));
    if (deleteOrderThunk.fulfilled.match(result)) {
      notify.success(`Order #${deleteTarget.id} deleted`);
      setDeleteTarget(null);
    } else {
      notify.error(`Failed to delete order: ${result.payload}`);
    }
  };

  const handleDateRangeFilter = async () => {
    if (!dateFrom || !dateTo) {
      notify.warning("Please select both start and end dates");
      return;
    }
    const result = await dispatch(getOrdersByDateRangeThunk({ startDate: dateFrom, endDate: dateTo }));
    if (getOrdersByDateRangeThunk.fulfilled.match(result)) {
      setDateRangeActive(true);
      notify.info(`${result.payload.length} orders found in range`);
    } else {
      notify.error(`Failed to filter by date: ${result.payload}`);
    }
  };

  const handleClearDateRange = () => {
    setDateFrom("");
    setDateTo("");
    setDateRangeActive(false);
    dispatch(getAllOrdersThunk());
  };

  const handleRefresh = async () => {
    const [ordersResult] = await Promise.all([
      dispatch(getAllOrdersThunk()),
      dispatch(getOrderStatisticsThunk()),
    ]);
    if (getAllOrdersThunk.fulfilled.match(ordersResult)) {
      notify.info(`${(ordersResult.payload as Order[]).length} orders loaded`);
    } else {
      notify.error("Failed to refresh orders");
    }
  };

  /* ---- RENDER ---- */
  return (
    <div className="p-8 bg-white min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic m-0 text-black">
            Order <span className="not-italic">Control</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
            className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setModalMode("create")}
            className="bg-black text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 hover:bg-gray-800 transition-all cursor-pointer border-none outline-none"
          >
            <MdAdd size={18} /> New Order
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Orders"
          value={(statistics?.totalOrders ?? stats.total).toString()}
          icon={<MdReceipt size={22} />}
        />
        <StatCard
          label="Pending"
          value={stats.pending.toString()}
          icon={<MdAccessTime size={22} />}
          accent
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(statistics?.totalSpent ?? stats.revenue)}
          icon={<MdAttachMoney size={22} />}
        />
      </div>

      {/* STATUS BREAKDOWN — from API statistics */}
      {statistics?.ordersByStatus && Object.keys(statistics.ordersByStatus).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(statistics.ordersByStatus).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status as OrderStatus];
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
                className={`px-4 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                  statusFilter === status
                    ? "bg-black text-white border-black"
                    : cfg
                    ? `${cfg.bg} ${cfg.text} ${cfg.border} hover:border-black`
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-black"
                }`}
              >
                {cfg?.label ?? status} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Error: {error}</span>
          <button onClick={() => dispatch(clearOrderError())} className="hover:opacity-70 cursor-pointer bg-transparent border-none outline-none">
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search order ID..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="pl-9 pr-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors w-52"
          />
        </div>

        {/* Status Filter */}
        <StatusFilterDropdown current={statusFilter} onChange={setStatusFilter} />

        {/* Method Filter */}
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value)}
          className="px-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors bg-white cursor-pointer"
        >
          <option value="">All Methods</option>
          {(Object.entries(METHOD_LABELS) as [OrderMethod, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(searchText || statusFilter || methodFilter) && (
          <button
            onClick={() => { setSearchText(""); setStatusFilter(""); setMethodFilter(""); }}
            className="px-4 py-4 border border-black text-[11px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-2"
          >
            <MdClose size={14} /> Clear
          </button>
        )}
      </div>

      {/* DATE RANGE FILTER */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date Range:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-black text-[11px] font-bold outline-none focus:bg-gray-50 transition-colors"
          />
          <span className="text-gray-400 font-black text-sm">→</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 border border-black text-[11px] font-bold outline-none focus:bg-gray-50 transition-colors"
          />
          <button
            onClick={handleDateRangeFilter}
            disabled={!dateFrom || !dateTo || loading}
            className="px-5 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-40 border-none outline-none"
          >
            Apply
          </button>
          {dateRangeActive && (
            <button
              onClick={handleClearDateRange}
              className="px-5 py-2 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <MdClose size={12} /> Reset
            </button>
          )}
        </div>
        {dateRangeActive && (
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 border border-blue-200">
            ● Filtered by date range
          </span>
        )}
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-sm shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Loading Orders...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-black">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Order ID</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Amount</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Method</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Items</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Date</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                  {/* ORDER ID */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <MdReceipt size={16} />
                      </div>
                      <div>
                        <span className="block font-black text-black tracking-tight text-sm border-b-2 border-dotted border-gray-200">
                          #{order.id.slice(0, 10)}...
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-0.5 block">
                          User: {order.user_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* AMOUNT */}
                  <td className="px-6 py-5">
                    <span className="text-base font-black italic text-black tracking-tighter">
                      {formatCurrency(order.total_price)}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-5">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* METHOD */}
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                      {METHOD_LABELS[order.method as OrderMethod] ?? order.method}
                    </span>
                  </td>

                  {/* ITEMS */}
                  <td className="px-6 py-5">
                    <span className="text-[11px] font-black text-black">
                      {order.quantity} <span className="text-gray-400 font-bold">items</span>
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                      {formatDisplayDate(order.created_at)}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetail(order)}
                        title="View Detail"
                        className="p-2 bg-black text-white hover:bg-gray-700 transition-colors cursor-pointer outline-none border-none"
                      >
                        <MdVisibility size={16} />
                      </button>
                      <button
                        onClick={() => { setDetailTarget(order); setModalMode("update-status"); }}
                        title="Update Status"
                        className="p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer outline-none border-none"
                      >
                        <MdEdit size={16} />
                      </button>
                      {order.status?.toLowerCase().trim() === "pending" && (
                        <button
                          onClick={() => setCancelTarget(order)}
                          title="Cancel Order"
                          className="p-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer outline-none border-none"
                        >
                          <MdCancel size={16} />
                        </button>
                      )}
                      {order.status?.toLowerCase().trim() === "cancelled" && (
                        <button
                          onClick={() => setDeleteTarget(order)}
                          title="Delete"
                          className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer outline-none border-none"
                        >
                          <MdDeleteSweep size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No orders found.
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
          {filteredOrders.length} / {allOrders.length} orders
        </span>
      </div>

      {/* ===== MODALS ===== */}

      {/* Detail */}
      {modalMode === "detail" && detailTarget && (
        <DetailModal
          order={detailTarget}
          loadingItems={loadingDetail}
          onClose={handleCloseModal}
          onUpdateStatus={() => setModalMode("update-status")}
          onCancel={() => { setCancelTarget(detailTarget); setModalMode(null); }}
        />
      )}

      {/* Update Status */}
      {modalMode === "update-status" && detailTarget && (
        <UpdateStatusModal
          order={detailTarget}
          loading={loading}
          onClose={() => setModalMode("detail")}
          onSubmit={handleUpdateStatus}
        />
      )}

      {/* Create */}
      {modalMode === "create" && (
        <CreateOrderModal
          loading={loading}
          onClose={handleCloseModal}
          onSubmit={handleCreate}
        />
      )}

      {/* Cancel Confirm */}
      {cancelTarget && (
        <CancelConfirmModal
          order={cancelTarget}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelTarget(null)}
          loading={loading}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          order={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

/* =====================
   STAT CARD
===================== */
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}> = ({ label, value, icon, accent }) => (
  <div className={`border p-6 flex items-center justify-between ${accent ? "border-black bg-black text-white" : "border-gray-100 bg-gray-50"}`}>
    <div>
      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${accent ? "text-gray-400" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`text-2xl font-black tracking-tighter ${accent ? "text-white" : "text-black"}`}>
        {value}
      </p>
    </div>
    <div className={`p-3 ${accent ? "text-white/40" : "text-gray-300"}`}>
      {icon}
    </div>
  </div>
);