/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  MdConfirmationNumber,
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
  MdPercent,
  MdAttachMoney,
  MdCalendarToday,
  MdTune,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../app/store";
import {
  deleteCouponThunk,
  getAllCouponThunk,
  createCouponThunk,
  updateCouponThunk,
  clearSelectedCoupon,
  clearCouponError,
  getCouponByCodeThunk,
} from "../features/coupon/couponSlice";
import {
  getAllConditionSetsThunk,
  getConditionSetByIdThunk,
} from "../features/conditionSet/conditionSetSlice";
import type { Coupon, CreateCouponRequest, CouponType } from "../features/coupon/couponType";
import type { ConditionSet, ConditionSetWithDetails } from "../features/conditionSet/conditionSetType";
import { notify } from "../utils/notify";

/* =====================
   TYPES
===================== */
type ModalMode = "create" | "edit" | "detail" | null;

interface FormState {
  code: string;
  type: CouponType;
  value: string;
  start_time: string;
  end_time: string;
  usage_limit: string;
  max_discount: string;
  condition_set_id: string;
}

const defaultForm: FormState = {
  code: "",
  type: "PERCENT",
  value: "",
  start_time: "",
  end_time: "",
  usage_limit: "",
  max_discount: "",
  condition_set_id: "",
};

/* =====================
   HELPERS
===================== */
const formatCurrency = (value: number | null | undefined) => {
  if (!value) return "0";
  return value >= 1000 ? `${value / 1000}K` : value;
};

const formatDateInput = (iso: string) => {
  if (!iso) return "";
  return iso.slice(0, 16);
};

const formatDisplayDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CONDITION_TYPE_LABELS: Record<string, string> = {
  MIN_ORDER_VALUE: "Min Order Value",
  TIER:           "Membership Tier",
  NEW_USER:       "New User",
  DAY_OF_WEEK:    "Day of Week",
  HOUR_OF_DAY:    "Hour of Day",
};

/* =====================
   DELETE CONFIRM MODAL
===================== */
interface DeleteConfirmProps {
  coupon: Coupon;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ coupon, onConfirm, onCancel, loading }) => (
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
        Are you sure you want to delete this coupon? This action{" "}
        <strong className="text-black">cannot be undone</strong>.
      </p>
      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <MdConfirmationNumber size={22} className="text-blue-500 shrink-0" />
        <div>
          <p className="font-black text-black uppercase tracking-tight">{coupon.code}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {coupon.type === "PERCENT" ? `-${coupon.value}%` : `-${formatCurrency(coupon.value)} VND`}
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
          {loading ? "Deleting..." : "Delete Coupon"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   DETAIL MODAL
===================== */
interface DetailModalProps {
  coupon: Coupon;
  onClose: () => void;
  onEdit: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ coupon, onClose, onEdit }) => {
  const percent = coupon.usage_limit > 0
    ? Math.min((coupon.used_count / coupon.usage_limit) * 100, 100) : 0;
  const isExpired = new Date(coupon.end_time) < new Date();
  const isActive = !isExpired && !coupon.is_deleted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Coupon Detail</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">ID: {coupon.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-4 py-2 bg-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer border-none outline-none">
              <MdEdit size={14} /> Edit
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
              <MdClose size={18} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-4xl font-black uppercase tracking-tighter text-black">{coupon.code}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {isActive ? "● Active" : "● Expired"}
                </span>
                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">{coupon.type}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-5xl font-black italic text-black leading-none">
                {coupon.type === "PERCENT" ? `-${coupon.value}%` : `-${formatCurrency(coupon.value)}`}
              </span>
              {coupon.max_discount && (
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Max: {formatCurrency(coupon.max_discount)} VND</p>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <div className="flex justify-between mb-2 text-[10px] font-black uppercase tracking-widest">
              <span className="text-gray-500">Usage</span>
              <span className="text-black">{coupon.used_count} / {coupon.usage_limit} ({Math.round(percent)}%)</span>
            </div>
            <div className="h-2 bg-gray-100 overflow-hidden rounded-full">
              <div className="h-full bg-black rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={<MdCalendarToday size={16} />} label="Start Date" value={formatDisplayDate(coupon.start_time)} />
            <InfoCard icon={<MdCalendarToday size={16} />} label="End Date" value={formatDisplayDate(coupon.end_time)} />
            <InfoCard icon={<MdAccessTime size={16} />} label="Created At" value={formatDisplayDate(coupon.created_at)} />
            <InfoCard icon={<MdRefresh size={16} />} label="Updated At" value={formatDisplayDate(coupon.updated_at)} />
          </div>

          {coupon.conditionSet && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdTune size={16} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Applied Conditions</span>
                </div>
                <p className="font-bold text-sm text-black mb-3">{coupon.conditionSet.name}</p>
                {coupon.conditionSet.details?.map((d) => (
                  <div key={d.condition_detail_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      {d.condition_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-black text-black px-3 py-1 bg-gray-50">{d.condition_value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
   CREATE / EDIT MODAL
===================== */
interface FormModalProps {
  mode: "create" | "edit";
  initialData?: Coupon | null;
  loading: boolean;
  conditionSets: ConditionSet[];
  onClose: () => void;
  onSubmit: (data: CreateCouponRequest) => void;
  onFetchConditionSet: (id: string) => Promise<ConditionSetWithDetails | null>;
}

const FormModal: React.FC<FormModalProps> = ({
  mode, initialData, loading, conditionSets, onClose, onSubmit, onFetchConditionSet,
}) => {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initialData) {
      return {
        code: initialData.code,
        type: initialData.type,
        value: initialData.value.toString(),
        start_time: formatDateInput(initialData.start_time),
        end_time: formatDateInput(initialData.end_time),
        usage_limit: initialData.usage_limit.toString(),
        max_discount: initialData.max_discount?.toString() ?? "",
        condition_set_id: initialData.condition_set_id ?? "",
      };
    }
    return defaultForm;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [previewSet, setPreviewSet] = useState<ConditionSetWithDetails | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load preview for existing coupon on mount (edit mode)
  useEffect(() => {
    if (mode === "edit" && initialData?.condition_set_id) {
      handleConditionSetChange(initialData.condition_set_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConditionSetChange = async (id: string) => {
    setForm((f) => ({ ...f, condition_set_id: id }));
    setErrors((p) => ({ ...p, condition_set_id: undefined }));

    if (!id) {
      setPreviewSet(null);
      return;
    }

    setLoadingPreview(true);
    const detail = await onFetchConditionSet(id);
    setPreviewSet(detail);
    setLoadingPreview(false);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.code.trim()) e.code = "Coupon code is required";
    if (!form.value || isNaN(+form.value) || +form.value <= 0) e.value = "Value must be greater than 0";
    if (form.type === "PERCENT" && +form.value > 100) e.value = "Percentage cannot exceed 100";
    if (!form.start_time) e.start_time = "Select a start date";
    if (!form.end_time) e.end_time = "Select an end date";
    if (form.start_time && form.end_time && form.start_time >= form.end_time)
      e.end_time = "End date must be after start date";
    if (!form.usage_limit || isNaN(+form.usage_limit) || +form.usage_limit < 1)
      e.usage_limit = "Usage limit must be at least 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: CreateCouponRequest = {
      ...(mode === "create" && {
        id: crypto.randomUUID(),
      }),
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: parseFloat(form.value),
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      usage_limit: parseInt(form.usage_limit),
      max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
      condition_set_id: form.condition_set_id || null,
      conditions: [],
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">
              {mode === "create" ? "Create New Coupon" : "Edit Coupon"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {mode === "create" ? "Fill in the details below" : `Editing: ${initialData?.code}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Code */}
          <FormField label="Coupon Code *" error={errors.code}>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="e.g. SUMMER25"
              className={inputCls(!!errors.code)}
              style={{ textTransform: "uppercase" }}
            />
          </FormField>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount Type *">
              <select name="type" value={form.type} onChange={handleChange} className={inputCls(false)}>
                <option value="PERCENT">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (VND)</option>
              </select>
            </FormField>
            <FormField label={`Value (${form.type === "PERCENT" ? "%" : "VND"}) *`} error={errors.value}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {form.type === "PERCENT" ? <MdPercent size={14} /> : <MdAttachMoney size={14} />}
                </span>
                <input
                  name="value"
                  type="number"
                  value={form.value}
                  onChange={handleChange}
                  placeholder={form.type === "PERCENT" ? "10" : "50000"}
                  className={`${inputCls(!!errors.value)} pl-8`}
                />
              </div>
            </FormField>
          </div>

          {/* Max Discount */}
          {form.type === "PERCENT" && (
            <FormField label="Max Discount (VND)" error={errors.max_discount}>
              <input
                name="max_discount"
                type="number"
                value={form.max_discount}
                onChange={handleChange}
                placeholder="e.g. 100000"
                className={inputCls(!!errors.max_discount)}
              />
            </FormField>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date *" error={errors.start_time}>
              <input name="start_time" type="datetime-local" value={form.start_time} onChange={handleChange} className={inputCls(!!errors.start_time)} />
            </FormField>
            <FormField label="End Date *" error={errors.end_time}>
              <input name="end_time" type="datetime-local" value={form.end_time} onChange={handleChange} className={inputCls(!!errors.end_time)} />
            </FormField>
          </div>

          {/* Usage Limit */}
          <FormField label="Usage Limit *" error={errors.usage_limit}>
            <input
              name="usage_limit"
              type="number"
              value={form.usage_limit}
              onChange={handleChange}
              placeholder="e.g. 100"
              className={inputCls(!!errors.usage_limit)}
            />
          </FormField>

          {/* =====================
              CONDITION SET PICKER
          ===================== */}
          <div className="border border-dashed border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MdTune size={14} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Condition Set (optional)
              </span>
            </div>

            {/* Dropdown */}
            <FormField label="Select Condition Set" error={errors.condition_set_id}>
              <select
                value={form.condition_set_id}
                onChange={(e) => handleConditionSetChange(e.target.value)}
                className={inputCls(!!errors.condition_set_id)}
              >
                <option value="">— None —</option>
                {conditionSets.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.id} — {cs.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Preview panel */}
            {loadingPreview && (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 p-3 flex items-center justify-between animate-pulse">
                    <div className="h-2 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            )}

            {!loadingPreview && previewSet && (
              <div className="bg-gray-50 border border-gray-200 p-4 space-y-3">
                {/* Set header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-black text-sm uppercase tracking-tight">{previewSet.id}</p>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">{previewSet.name}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 ${
                    previewSet.is_reusable
                      ? "bg-green-50 text-green-700 border-green-300"
                      : "bg-gray-100 text-gray-500 border-gray-300"
                  }`}>
                    {previewSet.is_reusable ? "Reusable" : "Single use"}
                  </span>
                </div>

                {/* Condition rules */}
                {previewSet.details && previewSet.details.filter((d) => !d.is_deleted).length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      Rules ({previewSet.details.filter((d) => !d.is_deleted).length})
                    </p>
                    {previewSet.details
                      .filter((d) => !d.is_deleted)
                      .map((d) => (
                        <div
                          key={d.condition_detail_id}
                          className="flex items-center justify-between bg-white border border-gray-100 px-3 py-2"
                        >
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5">
                            {CONDITION_TYPE_LABELS[d.condition_type] ?? d.condition_type.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] font-black text-black">{d.condition_value}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold italic">No active rules in this set</p>
                )}
              </div>
            )}

            {!loadingPreview && !previewSet && form.condition_set_id && (
              <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                <MdInfo size={12} /> Failed to load condition set details
              </p>
            )}
          </div>

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
                <span className="animate-pulse">Saving...</span>
              ) : (
                <><MdCheckCircle size={14} /> {mode === "create" ? "Create Coupon" : "Save Changes"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 border text-sm font-bold bg-white outline-none transition-colors focus:border-black ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-400"
  }`;

const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
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
   MAIN COMPONENT
===================== */
export default function CouponManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { allCoupons, loading, error } = useSelector((state: RootState) => state.coupon);
  const { allConditionSets } = useSelector((state: RootState) => state.condition);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [detailTarget, setDetailTarget] = useState<Coupon | null>(null);

  const formatCurrencyDisplay = (value: number | null | undefined) => {
    if (!value) return "0";
    return value >= 1000 ? `${value / 1000}K` : value;
  };

  /* ---- HANDLERS ---- */
  const handleFetchConditionSet = async (id: string): Promise<ConditionSetWithDetails | null> => {
    const result = await dispatch(getConditionSetByIdThunk(id));
    if (getConditionSetByIdThunk.fulfilled.match(result)) return result.payload;
    return null;
  };

  const handleOpenCreate = () => {
    dispatch(clearSelectedCoupon());
    setEditTarget(null);
    setModalMode("create");
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditTarget(coupon);
    setDetailTarget(null);
    setModalMode("edit");
  };

  const handleOpenDetail = async (coupon: Coupon) => {
    setDetailTarget(coupon);
    setModalMode("detail");
    const result = await dispatch(getCouponByCodeThunk(coupon.code));
    if (getCouponByCodeThunk.fulfilled.match(result)) {
      setDetailTarget(result.payload);
    } else {
      notify.error("Failed to load coupon details");
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setDetailTarget(null);
    dispatch(clearSelectedCoupon());
    dispatch(clearCouponError());
  };

  const handleCreate = async (data: CreateCouponRequest) => {
    const result = await dispatch(createCouponThunk(data));
    if (createCouponThunk.fulfilled.match(result)) {
      notify.success(`Coupon "${result.payload.code}" created successfully!`);
      handleCloseModal();
    } else {
      notify.error(`Failed to create coupon: ${result.payload}`);
    }
  };

  const handleUpdate = async (data: CreateCouponRequest) => {
    if (!editTarget) return;
    const result = await dispatch(updateCouponThunk({ id: editTarget.id, data }));
    if (updateCouponThunk.fulfilled.match(result)) {
      notify.success(`Coupon "${result.payload.code}" updated successfully!`);
      handleCloseModal();
    } else {
      notify.error(`Failed to update coupon: ${result.payload}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteCouponThunk(deleteTarget.id));
    if (deleteCouponThunk.fulfilled.match(result)) {
      notify.success(`Coupon "${deleteTarget.code}" deleted successfully`);
      setDeleteTarget(null);
    } else {
      notify.error(`Failed to delete coupon: ${result.payload}`);
    }
  };

  const handleRefresh = async () => {
    const result = await dispatch(getAllCouponThunk());
    if (getAllCouponThunk.fulfilled.match(result)) {
      notify.info(`${result.payload.length} coupons loaded`);
    } else {
      notify.error("Failed to load coupon data");
    }
  };

  /* ---- EFFECTS ---- */
  useEffect(() => {
    dispatch(getAllCouponThunk());
    dispatch(getAllConditionSetsThunk());
  }, [dispatch]);

  /* ---- RENDER ---- */
  return (
    <div className="p-8 bg-white min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic m-0 text-black">
            Coupon <span className="text-black not-italic">Vault</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4" />
        </div>
        <div className="flex gap-3">
          <button onClick={handleRefresh} disabled={loading} title="Refresh" className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50">
            <MdRefresh size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenCreate} className="bg-black text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 hover:bg-gray-800 transition-all cursor-pointer border-none outline-none">
            <MdAdd size={18} /> New Coupon
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Error: {error}</span>
          <button onClick={() => dispatch(clearCouponError())} className="hover:opacity-70 cursor-pointer bg-transparent border-none outline-none">
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-sm shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Coupons...</span>
          </div>
        )}

        <table className="w-full table-fixed text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-black">
              <th className="px-6 py-5 w-[200px] text-[10px] font-black uppercase tracking-[0.2em]">Coupon Code</th>
              <th className="px-6 py-5 w-[160px] text-[10px] font-black uppercase tracking-[0.2em]">Benefit</th>
              <th className="px-6 py-5 w-[240px] text-[10px] font-black uppercase tracking-[0.2em]">Validity</th>
              <th className="px-6 py-5 w-[180px] text-[10px] font-black uppercase tracking-[0.2em]">Usage</th>
              <th className="px-4 py-5 w-[140px] text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {allCoupons.length > 0 ? (
              allCoupons.map((coupon) => {
                const percent = coupon.usage_limit > 0
                  ? Math.min((coupon.used_count / coupon.usage_limit) * 100, 100) : 0;
                const isExpired = new Date(coupon.end_time) < new Date();

                return (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded">
                          <MdConfirmationNumber size={18} />
                        </div>
                        <div>
                          <span className="block font-black text-black tracking-tight border-b-2 border-dotted border-gray-200 uppercase">{coupon.code}</span>
                          <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mt-1 block">ID: {coupon.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-black tracking-tighter leading-none italic">
                          {coupon.type === "PERCENT" ? `-${coupon.value}%` : `-${formatCurrencyDisplay(coupon.value)}`}
                        </span>
                        {coupon.max_discount && (
                          <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                            Max: {formatCurrencyDisplay(coupon.max_discount)} VND
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                        {formatDisplayDate(coupon.start_time)}
                        <span className="mx-1 text-gray-300">→</span>
                        <span className={isExpired ? "text-red-400" : "text-green-600"}>
                          {formatDisplayDate(coupon.end_time)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <div>
                        <div className="flex justify-between items-center mb-1 text-[10px] font-black uppercase">
                          <span>Used</span>
                          <span>{Math.round(percent)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 overflow-hidden">
                          <div className="h-full bg-black transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="m-0 mt-1 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                          {coupon.used_count} / {coupon.usage_limit} Limit
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenDetail(coupon)} title="View Detail" className="p-2 bg-black text-white hover:bg-gray-800 transition-colors border border-black/5 cursor-pointer outline-none">
                          <MdVisibility size={16} />
                        </button>
                        <button onClick={() => handleOpenEdit(coupon)} title="Edit" className="p-2 bg-black text-white hover:bg-gray-800 transition-colors border border-black/5 cursor-pointer outline-none">
                          <MdEdit size={16} />
                        </button>
                        <button onClick={() => setDeleteTarget(coupon)} title="Delete" className="p-2 hover:bg-red-500 hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none text-red-500">
                          <MdDeleteSweep size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
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

      {/* FOOTER */}
      <div className="mt-8 flex items-center justify-between text-gray-400">
        <div className="flex items-center gap-4">
          <MdAccessTime size={14} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Data synced directly from the admin system</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">{allCoupons.length} coupons</span>
      </div>

      {/* ===== MODALS ===== */}

      {modalMode === "detail" && detailTarget && (
        <DetailModal coupon={detailTarget} onClose={handleCloseModal} onEdit={() => handleOpenEdit(detailTarget)} />
      )}

      {(modalMode === "create" || modalMode === "edit") && (
        <FormModal
          mode={modalMode}
          initialData={editTarget}
          loading={loading}
          conditionSets={allConditionSets}
          onClose={handleCloseModal}
          onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
          onFetchConditionSet={handleFetchConditionSet}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          coupon={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={loading}
        />
      )}
    </div>
  );
}