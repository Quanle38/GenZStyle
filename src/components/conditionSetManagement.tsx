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
  MdTune,
  MdSearch,
  MdLayers,
  MdRepeat,
  MdBlock,
} from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  getAllConditionSetsThunk,
  getConditionSetByIdThunk,
  createConditionSetThunk,
  updateConditionSetThunk,
  deleteConditionSetThunk,
  clearSelectedConditionSet,
  clearConditionSetError,
} from "../features/conditionSet/conditionSetSlice";
import type {
  ConditionSet,
  ConditionSetWithDetails,
  ConditionDetailInput,
  CouponConditionType,
  CreateConditionSetRequest,
  UpdateConditionSetRequest,
} from "../features/conditionSet/conditionSetType";
import { notify } from "../utils/notify";

/* =====================
   TYPES
===================== */
type ModalMode = "create" | "edit" | "detail" | null;

interface FormState {
  id: string;
  name: string;
  is_reusable: boolean;
  details: ConditionDetailInput[];
}

const defaultForm: FormState = {
  id: "",
  name: "",
  is_reusable: true,
  details: [{ condition_type: "MIN_ORDER_VALUE", condition_value: "" }],
};

const CONDITION_TYPES: CouponConditionType[] = [
  "MIN_ORDER_VALUE",
  "TIER",
  "NEW_USER",
  "DAY_OF_WEEK",
  "HOUR_OF_DAY",
];

const CONDITION_LABELS: Record<CouponConditionType, string> = {
  MIN_ORDER_VALUE: "Min Order Value",
  TIER:           "Membership Tier",
  NEW_USER:       "New User",
  DAY_OF_WEEK:    "Day of Week",
  HOUR_OF_DAY:    "Hour of Day",
};

const CONDITION_PLACEHOLDERS: Record<CouponConditionType, string> = {
  MIN_ORDER_VALUE: "e.g. 500000",
  TIER:           "GOLD / SILVER / BRONZE",
  NEW_USER:       "true",
  DAY_OF_WEEK:    "MON,TUE or SAT,SUN",
  HOUR_OF_DAY:    "9-17",
};

/* =====================
   HELPERS
===================== */
const formatDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 border text-sm font-bold bg-white outline-none transition-colors focus:border-black ${
    hasError
      ? "border-red-400 bg-red-50"
      : "border-gray-200 hover:border-gray-400"
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

const InfoCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-black text-black text-sm">{value}</p>
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
      <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-gray-400">
        {label}
      </p>
      <p className={`text-2xl font-black tracking-tighter ${accent ? "text-white" : "text-black"}`}>
        {value}
      </p>
    </div>
    <div className={`p-3 ${accent ? "text-white/40" : "text-gray-300"}`}>{icon}</div>
  </div>
);

/* =====================
   DELETE CONFIRM MODAL
===================== */
const DeleteConfirmModal: React.FC<{
  target: ConditionSet;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ target, loading, onConfirm, onCancel }) => (
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
        Coupons using this set may be affected.
      </p>
      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <MdTune size={22} className="text-blue-500 shrink-0" />
        <div>
          <p className="font-black text-black uppercase tracking-tight">{target.id}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">{target.name}</p>
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
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   DETAIL MODAL
===================== */
const DetailModal: React.FC<{
  data: ConditionSetWithDetails;
  loadingDetail: boolean;
  onClose: () => void;
  onEdit: () => void;
}> = ({ data, loadingDetail, onClose, onEdit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter text-black">
            Condition Set Detail
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            ID: {data.id}
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
        {/* Name + badge */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-black leading-tight flex-1">
            {data.name}
          </h2>
          <span
            className={`shrink-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 flex items-center gap-1 ${
              data.is_reusable
                ? "bg-green-50 text-green-700 border-green-300"
                : "bg-gray-50 text-gray-500 border-gray-300"
            }`}
          >
            {data.is_reusable ? <MdRepeat size={12} /> : <MdBlock size={12} />}
            {data.is_reusable ? "Reusable" : "Single Use"}
          </span>
        </div>

        <div className="h-px bg-gray-100" />

        <div className="grid grid-cols-2 gap-4">
          <InfoCard icon={<MdAccessTime size={16} />} label="Created At" value={formatDate(data.created_at)} />
          <InfoCard icon={<MdRefresh size={16} />}    label="Updated At" value={formatDate(data.updated_at)} />
        </div>

        <div className="h-px bg-gray-100" />

        {/* Condition details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MdTune size={16} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Condition Rules
            </span>
          </div>

          {loadingDetail ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-50 border border-gray-100 p-3 flex items-center justify-between animate-pulse"
                >
                  <div className="h-2 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : data.details && data.details.filter((d) => !d.is_deleted).length > 0 ? (
            <div className="space-y-2">
              {data.details
                .filter((d) => !d.is_deleted)
                .map((d) => (
                  <div
                    key={d.condition_detail_id}
                    className="bg-gray-50 border border-gray-100 p-3 flex items-center justify-between"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-0.5 bg-white">
                      {CONDITION_LABELS[d.condition_type] ?? d.condition_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-black text-black px-3 py-1 bg-white border border-gray-200">
                      {d.condition_value}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest py-4 text-center border border-dashed border-gray-200">
              No condition rules defined
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

/* =====================
   FORM MODAL
===================== */
const FormModal: React.FC<{
  mode: "create" | "edit";
  initialData: ConditionSetWithDetails | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConditionSetRequest | UpdateConditionSetRequest) => void;
}> = ({ mode, initialData, loading, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initialData) {
      return {
        id: initialData.id,
        name: initialData.name,
        is_reusable: initialData.is_reusable,
        details: initialData.details
          .filter((d) => !d.is_deleted)
          .map((d) => ({
            condition_type: d.condition_type,
            condition_value: d.condition_value,
          })),
      };
    }
    return defaultForm;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "create") {
      if (!form.id.trim()) e.id = "ID is required";
      if (/\s/.test(form.id)) e.id = "No spaces allowed";
    }
    if (!form.name.trim()) e.name = "Name is required";
    if (form.details.length === 0) e._details = "At least 1 condition rule is required";
    form.details.forEach((d, i) => {
      if (!d.condition_type) e[`type_${i}`] = "Type is required";
      if (!d.condition_value.trim()) e[`val_${i}`] = "Value is required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addDetail = () =>
    setForm((f) => ({
      ...f,
      details: [
        ...f.details,
        { condition_type: "MIN_ORDER_VALUE", condition_value: "" },
      ],
    }));

  const removeDetail = (i: number) =>
    setForm((f) => ({ ...f, details: f.details.filter((_, idx) => idx !== i) }));

  const updateDetail = (i: number, field: keyof ConditionDetailInput, value: string) =>
    setForm((f) => {
      const details = [...f.details];
      details[i] = { ...details[i], [field]: value };
      return { ...f, details };
    });

  const handleSubmit = () => {
    if (!validate()) return;
    if (mode === "create") {
      const payload: CreateConditionSetRequest = {
        id: form.id.trim().toUpperCase(),
        name: form.name.trim(),
        is_reusable: form.is_reusable,
        details: form.details,
      };
      onSubmit(payload);
    } else {
      const payload: UpdateConditionSetRequest = {
        name: form.name.trim(),
        is_reusable: form.is_reusable,
        details: form.details,
      };
      onSubmit(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">
              {mode === "create" ? "Create Condition Set" : "Edit Condition Set"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {mode === "create"
                ? "Define conditions for coupon eligibility"
                : `Editing: ${initialData?.id}`}
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
          {/* ID — create only */}
          {mode === "create" && (
            <FormField label="Condition Set ID *" error={errors.id}>
              <input
                value={form.id}
                onChange={(e) => {
                  setForm((f) => ({ ...f, id: e.target.value.toUpperCase() }));
                  setErrors((p) => ({ ...p, id: "" }));
                }}
                placeholder="e.g. SET_GOLD_500K"
                className={inputCls(!!errors.id)}
              />
            </FormField>
          )}

          {/* Name */}
          <FormField label="Name *" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                setErrors((p) => ({ ...p, name: "" }));
              }}
              placeholder="e.g. Gold user - min order 500K"
              className={inputCls(!!errors.name)}
            />
          </FormField>

          {/* Reusable toggle */}
          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-4 py-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Reusable
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Allow this set to be reused across multiple coupons
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_reusable: !f.is_reusable }))}
              className={`w-12 h-6 rounded-full transition-colors cursor-pointer border-none outline-none relative flex-shrink-0 ${
                form.is_reusable ? "bg-black" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  form.is_reusable ? "left-6" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* Condition details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Condition Rules *
              </span>
              <button
                type="button"
                onClick={addDetail}
                className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-black hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
              >
                <MdAdd size={14} /> Add Rule
              </button>
            </div>

            {errors._details && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                <MdInfo size={12} /> {errors._details}
              </p>
            )}

            {form.details.map((detail, i) => (
              <div key={i} className="border border-dashed border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Rule {i + 1}
                  </span>
                  {form.details.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDetail(i)}
                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none outline-none"
                    >
                      <MdDeleteSweep size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Type *" error={errors[`type_${i}`]}>
                    <select
                      value={detail.condition_type}
                      onChange={(e) => {
                        updateDetail(i, "condition_type", e.target.value);
                        setErrors((p) => ({ ...p, [`type_${i}`]: "" }));
                      }}
                      className={inputCls(!!errors[`type_${i}`])}
                    >
                      {CONDITION_TYPES.map((ct) => (
                        <option key={ct} value={ct}>
                          {CONDITION_LABELS[ct]}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Value *" error={errors[`val_${i}`]}>
                    <input
                      value={detail.condition_value}
                      onChange={(e) => {
                        updateDetail(i, "condition_value", e.target.value);
                        setErrors((p) => ({ ...p, [`val_${i}`]: "" }));
                      }}
                      placeholder={
                        CONDITION_PLACEHOLDERS[detail.condition_type] ?? "value"
                      }
                      className={inputCls(!!errors[`val_${i}`])}
                    />
                  </FormField>
                </div>
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
                  {mode === "create" ? "Create" : "Save Changes"}
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
export default function ConditionSetManagement() {
  const dispatch = useAppDispatch();
  const {
    allConditionSets,
    loading,
    loadingDetail,
    error,
    pagination,
  } = useAppSelector((state) => state.condition);

  const [modalMode,    setModalMode]    = useState<ModalMode>(null);
  const [detailData,   setDetailData]   = useState<ConditionSetWithDetails | null>(null);
  const [editData,     setEditData]     = useState<ConditionSetWithDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConditionSet | null>(null);
  const [searchText,   setSearchText]   = useState("");

  /* ---- EFFECTS ---- */
  useEffect(() => {
    dispatch(getAllConditionSetsThunk());
  }, [dispatch]);

  /* ---- FILTERED LIST ---- */
  const filtered = useMemo(() => {
    if (!searchText) return allConditionSets;
    const q = searchText.toLowerCase();
    return allConditionSets.filter(
      (cs: ConditionSet) =>
        cs.id.toLowerCase().includes(q) ||
        cs.name.toLowerCase().includes(q)
    );
  }, [allConditionSets, searchText]);

  /* ---- HANDLERS ---- */
  const handleViewDetail = async (cs: ConditionSet) => {
    setDetailData({ ...cs, details: [] });
    setModalMode("detail");
    const result = await dispatch(getConditionSetByIdThunk(cs.id));
    if (getConditionSetByIdThunk.fulfilled.match(result)) {
      setDetailData(result.payload);
    } else {
      notify.error("Failed to load detail");
    }
  };

  const handleOpenEdit = async (cs: ConditionSet) => {
    const result = await dispatch(getConditionSetByIdThunk(cs.id));
    if (getConditionSetByIdThunk.fulfilled.match(result)) {
      setEditData(result.payload);
      setDetailData(null);
      setModalMode("edit");
    } else {
      notify.error("Failed to load data for editing");
    }
  };

  const handleEditFromDetail = () => {
    if (!detailData) return;
    setEditData(detailData);
    setModalMode("edit");
  };

  const handleClose = () => {
    setModalMode(null);
    setDetailData(null);
    setEditData(null);
    dispatch(clearSelectedConditionSet());
    dispatch(clearConditionSetError());
  };

  const handleCreate = async (data: CreateConditionSetRequest | UpdateConditionSetRequest) => {
    const result = await dispatch(createConditionSetThunk(data as CreateConditionSetRequest));
    if (createConditionSetThunk.fulfilled.match(result)) {
      notify.success(`"${result.payload.id}" created successfully!`);
      handleClose();
    } else {
      notify.error(`Create failed: ${result.payload}`);
    }
  };

  const handleUpdate = async (data: CreateConditionSetRequest | UpdateConditionSetRequest) => {
    if (!editData) return;
    const result = await dispatch(
      updateConditionSetThunk({ id: editData.id, data: data as UpdateConditionSetRequest })
    );
    if (updateConditionSetThunk.fulfilled.match(result)) {
      notify.success(`"${result.payload.id}" updated successfully!`);
      handleClose();
    } else {
      notify.error(`Update failed: ${result.payload}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteConditionSetThunk(deleteTarget.id));
    if (deleteConditionSetThunk.fulfilled.match(result)) {
      notify.success(`"${deleteTarget.id}" deleted`);
      setDeleteTarget(null);
    } else {
      notify.error(`Delete failed: ${result.payload}`);
    }
  };

  const handleRefresh = async () => {
    const result = await dispatch(getAllConditionSetsThunk());
    if (getAllConditionSetsThunk.fulfilled.match(result)) {
      notify.info(`${result.payload.totalConditionSet} condition sets loaded`);
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
            Condition <span className="not-italic">Sets</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4" />
        </div>
        <div className="flex items-center gap-3">
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
            <MdAdd size={18} /> New Set
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Sets"
          value={pagination.totalConditionSet.toString()}
          icon={<MdLayers size={22} />}
        />
        <StatCard
          label="Pages"
          value={`${pagination.currentPage} / ${pagination.totalPage}`}
          icon={<MdTune size={22} />}
        />
        <StatCard
          label="Showing"
          value={`${filtered.length}`}
          icon={<MdAccessTime size={22} />}
          accent
        />
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold uppercase tracking-wider flex items-center justify-between">
          <span>Error: {error}</span>
          <button
            onClick={() => dispatch(clearConditionSetError())}
            className="hover:opacity-70 cursor-pointer bg-transparent border-none outline-none"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <MdSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by ID or name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 pr-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors w-72"
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
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Loading...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">ID</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Name</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Reusable</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Created</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Updated</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length > 0 ? (
              filtered.map((cs) => (
                <tr key={cs.id} className="hover:bg-gray-50/50 transition-all">
                  {/* ID */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded">
                        <MdTune size={16} />
                      </div>
                      <span className="font-black text-black text-sm uppercase tracking-tight border-b-2 border-dotted border-gray-200">
                        {cs.id}
                      </span>
                    </div>
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-5 max-w-[260px]">
                    <span className="text-sm font-bold text-gray-700 block truncate">
                      {cs.name}
                    </span>
                  </td>

                  {/* REUSABLE */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 ${
                        cs.is_reusable
                          ? "bg-green-50 text-green-700 border-green-300"
                          : "bg-gray-50 text-gray-500 border-gray-300"
                      }`}
                    >
                      {cs.is_reusable ? <MdRepeat size={11} /> : <MdBlock size={11} />}
                      {cs.is_reusable ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {formatDate(cs.created_at)}
                    </span>
                  </td>

                  {/* UPDATED */}
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {formatDate(cs.updated_at)}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetail(cs)}
                        title="View"
                        className="p-2 bg-black text-white hover:bg-gray-700 transition-colors cursor-pointer outline-none border-none"
                      >
                        <MdVisibility size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(cs)}
                        title="Edit"
                        className="p-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer outline-none border-none"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cs)}
                        title="Delete"
                        className="p-2 bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer outline-none border-none"
                      >
                        <MdDeleteSweep size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs"
                  >
                    No condition sets found.
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
          {filtered.length} / {pagination.totalConditionSet} sets
        </span>
      </div>

      {/* ===== MODALS ===== */}

      {modalMode === "detail" && detailData && (
        <DetailModal
          data={detailData}
          loadingDetail={loadingDetail}
          onClose={handleClose}
          onEdit={handleEditFromDetail}
        />
      )}

      {modalMode === "create" && (
        <FormModal
          mode="create"
          initialData={null}
          loading={loading}
          onClose={handleClose}
          onSubmit={handleCreate}
        />
      )}

      {modalMode === "edit" && editData && (
        <FormModal
          mode="edit"
          initialData={editData}
          loading={loading}
          onClose={handleClose}
          onSubmit={handleUpdate}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          loading={loading}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}