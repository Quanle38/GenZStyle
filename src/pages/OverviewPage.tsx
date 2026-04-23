// pages/admin/OverviewPage.tsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
  

import { AlertCircle, RotateCcw, ShoppingBag, Tag, TrendingUp, Users } from "lucide-react";
import {
    Area, Bar, CartesianGrid, Cell,
    ComposedChart, BarChart, Pie, PieChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { AppDispatch, RootState } from "../app/store";
import { getOverviewThunk } from "../features/report/reportSlice";

// ─── CONSTANTS ────────────────────────────────────────────────
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const PIE_COLORS    = ["#000000","#555555","#888888","#bbbbbb","#dddddd"];
const STATUS_COLORS = ["#000000","#4B5563","#EF4444","#F59E0B"];

const formatVND = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
    if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K`;
    return `${v}`;
};

// ─── STAT CARD ────────────────────────────────────────────────
interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.ReactNode;
    positive?: boolean;
}
function StatCard({ label, value, sub, icon, positive = true }: StatCardProps) {
    return (
        <div className="bg-white border border-gray-100 p-6 flex flex-col gap-3 hover:border-black transition-colors duration-200">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
                <div className="text-gray-300">{icon}</div>
            </div>
            <p className="text-3xl font-black tracking-tight text-black">{value}</p>
            <p className={`text-xs font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>{sub}</p>
        </div>
    );
}

// ─── SECTION HEADER ───────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-lg font-black uppercase tracking-wider text-black">{title}</h2>
            <div className="w-8 h-[2px] bg-black mt-1" />
        </div>
    );
}

// ─── SKELETON ─────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────
type CustomTooltipProps = {
    active?: boolean;
    payload?: Array<{ value?: number; name?: string }>;
    label?: string;
};
function RevenueTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-black text-white px-3 py-2 text-xs font-bold">
            <p className="text-gray-400 mb-1">{label}</p>
            <p>Revenue: {((payload[0]?.value ?? 0) / 1_000_000).toFixed(1)}M ₫</p>
            <p>Orders: {payload[1]?.value ?? 0}</p>
        </div>
    );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function OverviewPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { overview, summary, loading, error } = useSelector(
        (state: RootState) => state.report
    );

    useEffect(() => {
        dispatch(getOverviewThunk()); // truyền năm cụ thể nếu muốn: getOverviewThunk(2024)
    }, [dispatch]);

    // ── Chuyển revenueByMonth (month: number) → thêm label chữ cho chart
    const revenueChartData = (overview?.revenueByMonth ?? []).map((d) => ({
        ...d,
        month: MONTH_LABELS[d.month - 1],
    }));

    // ── newUsersByMonth tương tự
    const newUsersChartData = (overview?.newUsersByMonth ?? []).map((d) => ({
        ...d,
        month: MONTH_LABELS[d.month - 1],
    }));

    // ─── ERROR STATE ──────────────────────────────────────────
    if (error) {
        return (
            <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 text-red-600">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Page title */}
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black">Overview</h1>
                <div className="w-12 h-[3px] bg-black mt-2" />
            </div>

            {/* ── STAT CARDS ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-36" />
                    ))
                ) : (
                    <>
                        <StatCard
                            label="Annual Revenue"
                            value={`${((summary?.totalRevenue ?? 0) / 1_000_000).toFixed(0)}M ₫`}
                            sub="↑ 24% vs last year"
                            icon={<TrendingUp size={20} />}
                        />
                        <StatCard
                            label="Total Orders"
                            value={(summary?.totalOrders ?? 0).toLocaleString()}
                            sub="↑ 18% vs last year"
                            icon={<ShoppingBag size={20} />}
                        />
                        <StatCard
                            label="New Users (6 months)"
                            value={(summary?.newUsers ?? 0).toString()}
                            sub="↑ 31% vs last period"
                            icon={<Users size={20} />}
                        />
                        <StatCard
                            label="Return / Cancel Rate"
                            value={`${summary?.returnCancelRate ?? 0}%`}
                            sub={`${(summary?.returnCancelRate ?? 0) > 10 ? "↑ above threshold" : "↓ within threshold"}`}
                            icon={<RotateCcw size={20} />}
                            positive={(summary?.returnCancelRate ?? 0) <= 10}
                        />
                    </>
                )}
            </div>

            {/* ── REVENUE + ORDERS CHART ── */}
            <div className="bg-white border border-gray-100 p-6">
                <SectionHeader title="Revenue & Orders by Month" />
                {loading ? (
                    <Skeleton className="h-[280px]" />
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart
                            data={revenueChartData}
                            margin={{ top: 4, right: 56, left: 16, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#000" stopOpacity={0.12} />
                                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left"  tickFormatter={formatVND} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={48} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
                            <Tooltip content={<RevenueTooltip />} />
                            <Bar  yAxisId="right" dataKey="orders"  fill="#e5e7eb" name="Orders"  barSize={28} radius={[3, 3, 0, 0]} />
                            <Area yAxisId="left"  type="monotone" dataKey="revenue" stroke="#000" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── ROW 2: Top Products + Category Pie ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Top products */}
                <div className="bg-white border border-gray-100 p-6">
                    <SectionHeader title="Top Selling Products" />
                    {loading ? (
                        <Skeleton className="h-[240px]" />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart
                                data={overview?.topProducts ?? []}
                                layout="vertical"
                                margin={{ left: 0, right: 16 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value) => [`${value ?? 0} items`, "Sold"] as [string, string]}
                                    contentStyle={{ background: "#000", border: "none", color: "#fff", fontSize: 12 }}
                                    itemStyle={{ color: "#fff" }}
                                    labelStyle={{ color: "#9ca3af" }}
                                />
                                <Bar dataKey="sold" fill="#000" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Category pie */}
                <div className="bg-white border border-gray-100 p-6">
                    <SectionHeader title="Revenue by Category" />
                    {loading ? (
                        <Skeleton className="h-[220px]" />
                    ) : (
                        <div className="flex items-center gap-4">
                            <ResponsiveContainer width="55%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={overview?.categoryRevenue ?? []}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={3} dataKey="value"
                                    >
                                        {(overview?.categoryRevenue ?? []).map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`${value ?? 0}%`, ""] as [string, string]}
                                        contentStyle={{ background: "#000", border: "none", color: "#fff", fontSize: 12 }}
                                        itemStyle={{ color: "#fff" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-col gap-2">
                                {(overview?.categoryRevenue ?? []).map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                                        <span className="text-xs text-gray-600">{d.name}</span>
                                        <span className="text-xs font-bold text-black ml-auto pl-4">{d.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── ROW 3: Order Status + New Users ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Order status donut */}
                <div className="bg-white border border-gray-100 p-6">
                    <SectionHeader title="Order Status Breakdown" />
                    {loading ? (
                        <Skeleton className="h-[220px]" />
                    ) : (
                        <>
                            <div className="flex items-center gap-4">
                                <ResponsiveContainer width="55%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={overview?.orderStatusBreakdown ?? []}
                                            cx="50%" cy="50%"
                                            innerRadius={60} outerRadius={90}
                                            paddingAngle={3} dataKey="value"
                                        >
                                            {(overview?.orderStatusBreakdown ?? []).map((_, i) => (
                                                <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [`${value ?? 0}%`, ""] as [string, string]}
                                            contentStyle={{ background: "#000", border: "none", color: "#fff", fontSize: 12 }}
                                            itemStyle={{ color: "#fff" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-col gap-3">
                                    {(overview?.orderStatusBreakdown ?? []).map((d, i) => (
                                        <div key={d.name} className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[i] }} />
                                            <span className="text-xs text-gray-600">{d.name}</span>
                                            <span className="text-xs font-bold text-black ml-auto pl-4">{d.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {(summary?.returnCancelRate ?? 0) > 10 && (
                                <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-3">
                                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-600 font-medium">
                                        Return + cancel rate is at <strong>{summary?.returnCancelRate}%</strong> — above the recommended threshold of 10%
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* New users */}
                <div className="bg-white border border-gray-100 p-6">
                    <SectionHeader title="New Users (Last 6 Months)" />
                    {loading ? (
                        <Skeleton className="h-[240px]" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={newUsersChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value) => [`${value ?? 0} users`, "New Users"] as [string, string]}
                                        contentStyle={{ background: "#000", border: "none", color: "#fff", fontSize: 12 }}
                                        itemStyle={{ color: "#fff" }}
                                        labelStyle={{ color: "#9ca3af" }}
                                    />
                                    <Bar dataKey="users" fill="#000" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>

                            {newUsersChartData.length > 0 && (() => {
                                const peak = [...newUsersChartData].sort((a, b) => b.users - a.users)[0];
                                return (
                                    <div className="mt-4 flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-3">
                                        <Tag size={14} className="text-gray-500 flex-shrink-0" />
                                        <p className="text-xs text-gray-500 font-medium">
                                            {peak.month} hit <strong className="text-black">{peak.users} new users</strong> — 6-month record
                                        </p>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}