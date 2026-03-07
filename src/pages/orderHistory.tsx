import React from "react";
import { MdLocalShipping, MdCheckCircle, MdCancel, MdPendingActions, MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// 1. Định nghĩa kiểu dữ liệu chặt chẽ để tránh lỗi TypeScript
type OrderStatus = "DELIVERED" | "SHIPPING" | "CANCELLED" | "PENDING";

interface OrderType {
  key: string;
  orderId: string;
  date: string;
  amount: number;
  status: OrderStatus;
  itemCount: number;
  image: string;
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();

  const orderData: OrderType[] = [
    {
      key: "1",
      orderId: "GZ-ORD-9921",
      date: "Mar 05, 2026",
      amount: 155.00,
      status: "SHIPPING",
      itemCount: 2,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
    },
    {
      key: "2",
      orderId: "GZ-ORD-8810",
      date: "Feb 28, 2026",
      amount: 89.90,
      status: "DELIVERED",
      itemCount: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200",
    },
  ];

  // 2. Hàm xử lý Badge trạng thái dùng thuần Tailwind
  const renderStatusBadge = (status: OrderStatus) => {
    const configs = {
      SHIPPING: { bg: "bg-blue-50", text: "text-blue-600", icon: <MdLocalShipping />, label: "IN TRANSIT" },
      DELIVERED: { bg: "bg-green-50", text: "text-green-600", icon: <MdCheckCircle />, label: "COMPLETED" },
      CANCELLED: { bg: "bg-red-50", text: "text-red-600", icon: <MdCancel />, label: "VOID" },
      PENDING: { bg: "bg-orange-50", text: "text-orange-600", icon: <MdPendingActions />, label: "PROCESSING" },
    };

    const config = configs[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] tracking-tight ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    );
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

        {/* Header Section */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black m-0 uppercase tracking-tighter italic leading-none">
            PURCHASES <br />
            <span className="text-gray-100 not-italic">ARCHIVE</span>
          </h1>
          <div className="h-3 w-32 bg-black mt-6"></div>
        </div>

        {/* Tailwind Table */}
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Reference</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Details</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Total</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orderData.map((order) => (
                <tr key={order.key} className="group hover:bg-gray-50/30 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="relative overflow-hidden w-16 h-16 bg-gray-100 rounded-lg">
                        <img 
                          src={order.image} 
                          alt="product" 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                        />
                      </div>
                      <div>
                        <p className="font-black text-black tracking-tighter m-0 text-base italic">#{order.orderId}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest m-0 mt-1">{order.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-500 text-sm uppercase tracking-tighter">
                    {order.itemCount} Items
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-black text-black text-lg tracking-tighter underline decoration-2 underline-offset-4 decoration-gray-200">
                      ${order.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {renderStatusBadge(order.status)}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="bg-black text-white hover:bg-white hover:text-black border border-black uppercase text-[10px] font-black h-10 px-8 transition-all tracking-widest cursor-pointer shadow-lg shadow-black/5">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Banner Section */}
        <div className="mt-16 bg-black p-12 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-white text-3xl font-black uppercase tracking-tighter italic m-0">Need help with an order?</h2>
              <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold mt-2 m-0">Our squad is online 24/7 to support you.</p>
            </div>
            <button className="bg-white text-black font-black uppercase text-[11px] h-14 px-12 tracking-[0.2em] hover:bg-gray-200 transition-all cursor-pointer border-none outline-none">
              Contact Us
            </button>
          </div>
          {/* Background Text Decor */}
          <div className="absolute -bottom-8 -right-8 text-[180px] font-black text-white/[0.03] leading-none pointer-events-none select-none italic tracking-tighter">
            GENZ
          </div>
        </div>
      </div>
    </div>
  );
}