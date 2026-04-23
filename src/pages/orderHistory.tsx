import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    MdLocalShipping, MdCheckCircle, MdCancel,
    MdPendingActions, MdArrowBack, MdExpandMore, MdExpandLess,
} from "react-icons/md";
import type { AppDispatch, RootState } from "../app/store";
import { getMyOrdersThunk, getOrderItemsThunk } from "../features/history/historySlice";
import type { Order,OrderItem } from "../features/history/historyType";

/* ── helpers ── */
const formatVND = (amount: number | string) =>
    `${Number(amount).toLocaleString("vi-VN")} ₫`;

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });

/* ── status config ── */
type StatusKey = "pending" | "processing" | "shipping" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<StatusKey, {
    bg: string; text: string;
    icon: React.ReactNode; label: string;
}> = {
    pending:    { bg: "bg-orange-50",  text: "text-orange-600", icon: <MdPendingActions />, label: "PROCESSING" },
    processing: { bg: "bg-blue-50",    text: "text-blue-600",   icon: <MdPendingActions />, label: "PROCESSING" },
    shipping:   { bg: "bg-blue-50",    text: "text-blue-600",   icon: <MdLocalShipping />,  label: "IN TRANSIT"  },
    delivered:  { bg: "bg-green-50",   text: "text-green-600",  icon: <MdCheckCircle />,    label: "COMPLETED"   },
    cancelled:  { bg: "bg-red-50",     text: "text-red-600",    icon: <MdCancel />,         label: "VOID"        },
};

const renderStatusBadge = (status: string) => {
    const cfg = STATUS_CONFIG[status as StatusKey] ?? {
        bg: "bg-gray-50", text: "text-gray-500",
        icon: null, label: status.toUpperCase(),
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] tracking-tight ${cfg.bg} ${cfg.text}`}>
            {cfg.icon}
            {cfg.label}
        </span>
    );
};

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function OrderHistoryPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { orders, orderItems, loading, loadingDetail } = useSelector(
        (s: RootState) => s.history
    );

    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getMyOrdersThunk());
    }, [dispatch]);

    const handleToggleDetail = (order: Order) => {
        if (expandedId === order.id) {
            setExpandedId(null);
        } else {
            setExpandedId(order.id);
            dispatch(getOrderItemsThunk(order.id));
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-black selection:text-white">
            <div className="max-w-6xl mx-auto px-6 py-16">

                {/* Navigation */}
                <div className="mb-12 flex items-center justify-between border-b border-gray-100 pb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-2 text-gray-400 hover:text-black transition-all bg-transparent border-none cursor-pointer p-0 outline-none"
                    >
                        <MdArrowBack className="group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase text-[10px] font-black tracking-[0.2em]">Back to Store</span>
                    </button>
                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden sm:block">
                        Member Area / <span className="text-black">Order History</span>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-16">
                    <h1 className="text-6xl md:text-8xl font-black m-0 uppercase tracking-tighter italic leading-none">
                        PURCHASES <br />
                        <span className="text-gray-100 not-italic">ARCHIVE</span>
                    </h1>
                    <div className="h-3 w-32 bg-black mt-6" />
                </div>

                {/* Table */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 text-gray-300">
                        <p className="text-5xl font-black uppercase italic tracking-tighter">No Orders Yet</p>
                        <button
                            onClick={() => navigate("/shop")}
                            className="mt-8 bg-black text-white px-10 py-3 uppercase text-xs font-black tracking-widest hover:bg-gray-800 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    {["Reference", "Items", "Total", "Status", "Action"].map((h, i) => (
                                        <th
                                            key={h}
                                            className={`px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 ${i === 4 ? "text-right" : ""}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const isExpanded = expandedId === order.id;
                                    return (
                                        <>
                                            {/* ORDER ROW */}
                                            <tr
                                                key={order.id}
                                                className="group border-t border-gray-50 hover:bg-gray-50/30 transition-all"
                                            >
                                                {/* Reference */}
                                                <td className="px-8 py-6">
                                                    <p className="font-black text-black tracking-tighter text-base italic">
                                                        #{order.id}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                                                        {formatDate(order.created_at)}
                                                    </p>
                                                </td>

                                                {/* Items count */}
                                                <td className="px-8 py-6 font-bold text-gray-500 text-sm uppercase tracking-tighter">
                                                    {order.quantity} item{order.quantity > 1 ? "s" : ""}
                                                </td>

                                                {/* Total */}
                                                <td className="px-8 py-6">
                                                    <span className="font-black text-black text-lg tracking-tighter underline decoration-2 underline-offset-4 decoration-gray-200">
                                                        {formatVND(order.total_price)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-8 py-6">
                                                    {renderStatusBadge(order.status)}
                                                </td>

                                                {/* Action */}
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => handleToggleDetail(order)}
                                                        className="inline-flex items-center gap-2 bg-black text-white hover:bg-white hover:text-black border border-black uppercase text-[10px] font-black h-10 px-6 transition-all tracking-widest cursor-pointer shadow-lg shadow-black/5"
                                                    >
                                                        {isExpanded ? (
                                                            <><MdExpandLess size={14} /> Hide</>
                                                        ) : (
                                                            <><MdExpandMore size={14} /> Details</>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>

                                           {/* DETAIL ROW */}
{isExpanded && (
    <tr key={`${order.id}-detail`} className="bg-gray-50/60">
        <td colSpan={5} className="px-8 py-6">
            {loadingDetail ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                    ))}
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-[10px] text-gray-400 uppercase tracking-widest font-black border-b border-gray-200">
                            <th className="text-left pb-3">Product</th>
                            <th className="text-center pb-3">Qty</th>
                            <th className="text-right pb-3">Unit Price</th>
                            <th className="text-right pb-3">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orderItems.map((item: OrderItem) => (
                            <tr key={item.id}>
                                {/* Product info */}
                                <td className="py-4">
                                    <div className="flex items-center gap-4">
                                        {item.variant?.image ? (
                                            <img
                                                src={item.variant.image}
                                                alt={item.variant_id}
                                                className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gray-200 rounded-lg shrink-0" />
                                        )}
                                        <div>
                                            <p className="font-black text-gray-900 text-sm tracking-tight">
                                                {item.variant_id}
                                            </p>
                                            {item.variant && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span
                                                        className="inline-block w-3 h-3 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: item.variant.color.toLowerCase() }}
                                                    />
                                                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                                                        {item.variant.color} · Size {item.variant.size}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Qty */}
                                <td className="py-4 text-center text-gray-700 font-bold">
                                    {item.quantity}
                                </td>

                                {/* Unit price */}
                                <td className="py-4 text-right text-gray-600">
                                    {formatVND(item.price_per_unit)}
                                </td>

                                {/* Subtotal */}
                                <td className="py-4 text-right font-black text-gray-900">
                                    {formatVND(Number(item.price_per_unit) * item.quantity)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="pt-4 text-right text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                Order Total
                            </td>
                            <td className="pt-4 text-right font-black text-black text-base">
                                {formatVND(order.total_price)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            )}
        </td>
    </tr>
)}
                                        </>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Banner */}
                <div className="mt-16 bg-black p-12 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h2 className="text-white text-3xl font-black uppercase tracking-tighter italic m-0">
                                Need help with an order?
                            </h2>
                            <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold mt-2 m-0">
                                Our squad is online 24/7 to support you.
                            </p>
                        </div>
                        <button className="bg-white text-black font-black uppercase text-[11px] h-14 px-12 tracking-[0.2em] hover:bg-gray-200 transition-all cursor-pointer border-none outline-none">
                            Contact Us
                        </button>
                    </div>
                    <div className="absolute -bottom-8 -right-8 text-[180px] font-black text-white/[0.03] leading-none pointer-events-none select-none italic tracking-tighter">
                        GENZ
                    </div>
                </div>

            </div>
        </div>
    );
}