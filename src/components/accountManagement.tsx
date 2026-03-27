/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  MdAdd,
  MdEdit,
  MdDeleteForever,
  MdVisibility,
  MdClose,
  MdSearch,
  MdFilterList,
  MdSortByAlpha,
  MdHistory,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdLocationOn,
  MdPerson,
  MdRefresh,
  MdAccessTime,
  MdWarning,
  MdCheckCircle,
  MdInfo,
  MdLock,
} from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../app/store";
import {
  getAllUsersThunk,
  getUserThunk,
  deleteUserThunk,
  createUserThunk,
  updateUserThunk,
} from "../features/user/userSlice";
import type { UserProfile, CreateUserRequest } from "../features/user/userTypes";
import { notify } from "../utils/notify";
import dayjs from "dayjs";

/* =====================
   TYPES
===================== */
type ModalMode = "create" | "edit" | "detail" | null;
type SortOrder = "date-desc" | "date-asc" | "name-asc" | "name-desc";
type MembershipLevel = "BRONZE" | "SILVER" | "GOLD" | "";

interface FormState {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  address: string;
  gender: "MALE" | "FEMALE" | "";
  membership_id: MembershipLevel;
  phone_number: string;
  dob: string;
}

const defaultForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  address: "",
  gender: "",
  membership_id: "",
  phone_number: "",
  dob: "",
};

/* =====================
   HELPERS
===================== */
const getMemberStyle = (level: string) => {
  switch (level) {
    case "GOLD":   return { bg: "bg-yellow-400", text: "text-black", border: "border-black" };
    case "SILVER": return { bg: "bg-gray-300",   text: "text-black", border: "border-black" };
    case "BRONZE": return { bg: "bg-orange-700", text: "text-white", border: "border-black" };
    default:       return { bg: "bg-white",      text: "text-black", border: "border-black" };
  }
};

const MemberBadge: React.FC<{ level: string; size?: "sm" | "md" }> = ({ level, size = "sm" }) => {
  const s = getMemberStyle(level);
  return (
    <span
      className={`inline-block font-black uppercase border-2 ${s.bg} ${s.text} ${s.border} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
        size === "sm" ? "text-[9px] px-2 py-0.5" : "text-[11px] px-3 py-1"
      }`}
    >
      {level || "—"}
    </span>
  );
};

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  return dayjs(iso).format("MMM DD, YYYY");
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
  user: UserProfile;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ user, onConfirm, onCancel, loading }) => (
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
        Are you sure you want to delete this account? This action{" "}
        <strong className="text-black">cannot be undone</strong>.
      </p>

      <div className="bg-gray-50 border border-dashed border-gray-200 p-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0 overflow-hidden">
          {user.avatar
            ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            : <MdPerson size={20} className="text-gray-400" />
          }
        </div>
        <div>
          <p className="font-black text-black uppercase tracking-tight">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
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
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  </div>
);

/* =====================
   DETAIL MODAL
===================== */
interface DetailModalProps {
  user: UserProfile;
  onClose: () => void;
  onEdit: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ user, onClose, onEdit }) => {
  const s = getMemberStyle(user.membership_id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-black/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Membership color stripe */}
        <div className={`h-2 w-full ${s.bg}`} />

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-black">Account Profile</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              SYSTEM_ID: {user.id}
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
          {/* Avatar + Name */}
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              <div className="w-20 h-20 border-2 border-black overflow-hidden bg-gray-50">
                {user.avatar
                  ? <img src={user.avatar} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                  : <div className="w-full h-full flex items-center justify-center"><MdPerson size={36} className="text-gray-300" /></div>
                }
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-black leading-none">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <MemberBadge level={user.membership_id} size="md" />
                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-2 ${
                  user.gender === "MALE" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-pink-50 text-pink-700 border-pink-200"
                }`}>
                  {user.gender || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={<MdEmail size={16} />} label="Email" value={user.email} />
            <InfoCard icon={<MdPhone size={16} />} label="Phone" value={user.phone_number} />
            <InfoCard icon={<MdCalendarToday size={16} />} label="Date of Birth" value={formatDate(user.dob)} />
            <InfoCard icon={<MdAccessTime size={16} />} label="Joined" value={formatDate((user as any).created_at)} />
          </div>

          {/* Addresses */}
          {(user as any).addresses && (user as any).addresses.length > 0 && (
            <>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MdLocationOn size={16} className="text-gray-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Registered Addresses
                  </span>
                </div>
                <div className="space-y-2">
                  {(user as any).addresses.map((addr: any, i: number) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 p-3 flex items-start gap-3">
                      <span className="text-[9px] font-black border border-black px-2 py-0.5 shrink-0">
                        {addr.label}
                      </span>
                      <span className="text-xs font-bold text-gray-700">{addr.full_address}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({
  icon, label, value,
}) => (
  <div className="bg-gray-50 p-4">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="font-black text-black text-sm truncate">{value || "—"}</p>
  </div>
);

/* =====================
   FORM MODAL
===================== */
interface FormModalProps {
  mode: "create" | "edit";
  initialData?: UserProfile | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const FormModal: React.FC<FormModalProps> = ({ mode, initialData, loading, onClose, onSubmit }) => {
  const [form, setForm] = useState<FormState>(() => {
    if (mode === "edit" && initialData) {
      return {
        first_name: initialData.first_name ?? "",
        last_name:  initialData.last_name ?? "",
        email:      initialData.email ?? "",
        password:   "",
        address:    (initialData as any).address ?? "",
        gender:     (initialData.gender as any) ?? "",
        membership_id: (initialData.membership_id as any) ?? "",
        phone_number:  initialData.phone_number ?? "",
        dob:           initialData.dob ? dayjs(initialData.dob).format("YYYY-MM-DD") : "",
      };
    }
    return defaultForm;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim())  e.last_name  = "Last name is required";
    if (!form.email.trim())      e.email      = "Email is required";
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (mode === "create" && !form.password) e.password = "Password is required";
    if (mode === "create" && form.password.length < 6) e.password = "Minimum 6 characters";
    if (!form.gender)        e.gender        = "Select a gender";
    if (!form.membership_id) e.membership_id = "Select a membership tier";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof FormState]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload: any = { ...form };
    if (!payload.dob) delete payload.dob;
    if (mode === "edit") delete payload.password;
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
              {mode === "create" ? "Create New Account" : "Edit Account"}
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {mode === "create" ? "Fill in all required fields" : `Editing: ${initialData?.first_name} ${initialData?.last_name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 bg-white outline-none">
            <MdClose size={18} />
          </button>
        </div>

        <div className="p-8 space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name *" error={errors.first_name}>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Jane" className={inputCls(!!errors.first_name)} />
            </FormField>
            <FormField label="Last Name *" error={errors.last_name}>
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" className={inputCls(!!errors.last_name)} />
            </FormField>
          </div>

          {/* Email */}
          <FormField label="Email Address *" error={errors.email}>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="hello@example.com" disabled={mode === "edit"} className={`${inputCls(!!errors.email)} ${mode === "edit" ? "opacity-50 cursor-not-allowed" : ""}`} />
          </FormField>

          {/* Password (create only) */}
          {mode === "create" && (
            <FormField label="Password *" error={errors.password}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MdLock size={14} />
                </span>
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className={`${inputCls(!!errors.password)} pl-8`} />
              </div>
            </FormField>
          )}

          {/* Gender + Membership */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender *" error={errors.gender}>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputCls(!!errors.gender)}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </FormField>
            <FormField label="Membership Tier *" error={errors.membership_id}>
              <select name="membership_id" value={form.membership_id} onChange={handleChange} className={inputCls(!!errors.membership_id)}>
                <option value="">Select tier</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
              </select>
            </FormField>
          </div>

          {/* Phone + DOB */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number">
              <input name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="0909090909" className={inputCls(false)} />
            </FormField>
            <FormField label="Date of Birth">
              <input name="dob" type="date" value={form.dob} onChange={handleChange} className={inputCls(false)} />
            </FormField>
          </div>

          {/* Address */}
          <FormField label="Address">
            <input name="address" value={form.address} onChange={handleChange} placeholder="123 Street, District 1..." className={inputCls(false)} />
          </FormField>

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
                <>
                  <MdCheckCircle size={14} />
                  {mode === "create" ? "Create Account" : "Save Changes"}
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
   SORT DROPDOWN
===================== */
const SORT_LABELS: Record<SortOrder, string> = {
  "date-desc": "Newest First",
  "date-asc":  "Oldest First",
  "name-asc":  "Name A → Z",
  "name-desc": "Name Z → A",
};

interface SortDropdownProps {
  current: SortOrder;
  onChange: (v: SortOrder) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ current, onChange }) => {
  const [open, setOpen] = useState(false);
  const options: SortOrder[] = ["date-desc", "date-asc", "name-asc", "name-desc"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-2"
        title="Sort"
      >
        <MdFilterList size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-black/10 shadow-xl z-20">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  current === opt ? "bg-black text-white hover:bg-gray-800" : ""
                }`}
              >
                {opt.startsWith("name") ? <MdSortByAlpha size={14} /> : <MdHistory size={14} />}
                {SORT_LABELS[opt]}
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
export default function AccountManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, isLoading } = useSelector((state: RootState) => state.user);

  const [modalMode, setModalMode]       = useState<ModalMode>(null);
  const [editTarget, setEditTarget]     = useState<UserProfile | null>(null);
  const [detailTarget, setDetailTarget] = useState<UserProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const [searchText,       setSearchText]       = useState("");
  const [membershipFilter, setMembershipFilter] = useState<string>("");
  const [sortOrder,        setSortOrder]        = useState<SortOrder>("date-desc");

  /* ---- EFFECTS ---- */
  useEffect(() => { dispatch(getAllUsersThunk()); }, [dispatch]);

  /* ---- FILTERED LIST ---- */
  const filteredUsers = useMemo(() => {
    let result: UserProfile[] = Array.isArray(users) ? [...users] : [];

    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(u =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }

    if (membershipFilter) {
      result = result.filter(u => u.membership_id === membershipFilter);
    }

    result.sort((a: any, b: any) => {
      if (sortOrder === "name-asc")  return a.first_name.localeCompare(b.first_name);
      if (sortOrder === "name-desc") return b.first_name.localeCompare(a.first_name);
      const ta = dayjs(a.created_at).isValid() ? dayjs(a.created_at).unix() : 0;
      const tb = dayjs(b.created_at).isValid() ? dayjs(b.created_at).unix() : 0;
      return sortOrder === "date-desc" ? tb - ta : ta - tb;
    });

    return result;
  }, [users, searchText, membershipFilter, sortOrder]);

  /* ---- HANDLERS ---- */
  const handleOpenCreate = () => {
    setEditTarget(null);
    setModalMode("create");
  };

  const handleOpenEdit = (u: UserProfile) => {
    setEditTarget(u);
    setDetailTarget(null);
    setModalMode("edit");
  };

  const handleOpenDetail = async (u: UserProfile) => {
    setDetailTarget(u);
    setModalMode("detail");
    const result = await dispatch(getUserThunk(u.id));
    if (getUserThunk.fulfilled.match(result)) {
      setDetailTarget(result.payload as any);
    } else {
      notify.error("Failed to load account details");
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setDetailTarget(null);
  };

  const handleCreate = async (data: CreateUserRequest) => {
    const result = await dispatch(createUserThunk(data));
    if (createUserThunk.fulfilled.match(result)) {
      notify.success(`Account "${data.first_name} ${data.last_name}" created successfully!`);
      handleCloseModal();
      dispatch(getAllUsersThunk());
    } else {
      notify.error(`Failed to create account: ${result.payload ?? "Unknown error"}`);
    }
  };

  const handleUpdate = async (data: Partial<CreateUserRequest>) => {
    if (!editTarget) return;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    const result = await dispatch(updateUserThunk({ id: editTarget.id, body: formData }));
    if (updateUserThunk.fulfilled.match(result)) {
      notify.success(`Account updated successfully!`);
      handleCloseModal();
      dispatch(getAllUsersThunk());
    } else {
      notify.error(`Failed to update account: ${result.payload ?? "Unknown error"}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteUserThunk(deleteTarget.id));
    if (deleteUserThunk.fulfilled.match(result)) {
      notify.success(`Account "${deleteTarget.first_name} ${deleteTarget.last_name}" deleted`);
      setDeleteTarget(null);
      dispatch(getAllUsersThunk());
    } else {
      notify.error(`Failed to delete account: ${(result as any).payload ?? "Unknown error"}`);
    }
  };

  const handleRefresh = async () => {
    const result = await dispatch(getAllUsersThunk());
    if (getAllUsersThunk.fulfilled.match(result)) {
      notify.info(`${(result.payload as any[]).length} accounts loaded`);
    } else {
      notify.error("Failed to refresh accounts");
    }
  };

  /* ---- RENDER ---- */
  return (
    <div className="p-8 bg-white min-h-screen font-sans">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic m-0 text-black">
            Account <span className="not-italic">Registry</span>
          </h2>
          <div className="h-2 w-24 bg-black mt-4" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="pl-9 pr-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors w-56"
            />
          </div>

          {/* Membership Filter */}
          <select
            value={membershipFilter}
            onChange={e => setMembershipFilter(e.target.value)}
            className="px-4 py-4 border border-black text-[11px] font-bold uppercase outline-none focus:bg-gray-50 transition-colors bg-white cursor-pointer"
          >
            <option value="">All Tiers</option>
            <option value="BRONZE">Bronze</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
          </select>

          {/* Sort */}
          <SortDropdown current={sortOrder} onChange={setSortOrder} />

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh"
            className="p-4 border border-black hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdRefresh size={18} className={isLoading ? "animate-spin" : ""} />
          </button>

          {/* New User */}
          <button
            onClick={handleOpenCreate}
            className="bg-black text-white px-8 py-4 font-black uppercase text-[11px] tracking-[0.2em] flex items-center gap-2 hover:bg-gray-800 transition-all cursor-pointer border-none outline-none"
          >
            <MdAdd size={18} />
            New Account
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-x-auto border border-black/5 rounded-sm shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">
              Loading Accounts...
            </span>
          </div>
        )}

        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-black">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">User Info</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Email</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Membership</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em]">Joined</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-all group">
                  {/* USER INFO */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 border-2 border-black bg-white shrink-0 overflow-hidden flex items-center justify-center">
                        {u.avatar
                          ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          : <MdPerson size={18} className="text-gray-300" />
                        }
                      </div>
                      <div>
                        <span className="block font-black text-black tracking-tight uppercase text-sm">
                          {u.first_name} {u.last_name}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">
                          ID: {u.id?.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-5">
                    <span className="text-xs font-medium text-gray-500">{u.email}</span>
                  </td>

                  {/* MEMBERSHIP */}
                  <td className="px-6 py-5">
                    <MemberBadge level={u.membership_id} />
                  </td>

                  {/* JOINED */}
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {formatDate(u.created_at)}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenDetail(u)}
                        title="View"
                        className="p-2 hover:bg-black hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none"
                      >
                        <MdVisibility size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit"
                        className="p-2 hover:bg-black hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        title="Delete"
                        className="p-2 hover:bg-red-500 hover:text-white transition-colors border border-black/5 bg-white cursor-pointer outline-none text-red-500"
                      >
                        <MdDeleteForever size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No accounts found.
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
          {filteredUsers.length} / {Array.isArray(users) ? users.length : 0} accounts
        </span>
      </div>

      {/* ===== MODALS ===== */}

      {/* Detail */}
      {modalMode === "detail" && detailTarget && (
        <DetailModal
          user={detailTarget}
          onClose={handleCloseModal}
          onEdit={() => handleOpenEdit(detailTarget)}
        />
      )}

      {/* Create / Edit */}
      {(modalMode === "create" || modalMode === "edit") && (
        <FormModal
          mode={modalMode}
          initialData={editTarget}
          loading={isLoading}
          onClose={handleCloseModal}
          onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={isLoading}
        />
      )}
    </div>
  );
}