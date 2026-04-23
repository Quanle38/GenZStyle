// AdminLayout.tsx
import { MdMenu, MdMenuOpen } from "react-icons/md";
import { Button, Layout, Spin } from "antd";
import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AdminSideBar from "./adminSideBar";
import type { RootState } from "../../app/store";

const { Content } = Layout;

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, isLoading, isInitialized } = useSelector((state: RootState) => state.auth);

    // Chưa fetch xong lần đầu → chờ, không redirect vội
    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== "ADMIN") return <Navigate to="/login" replace />;

    return (
        <Layout className="min-h-screen bg-white">
            <AdminSideBar collapsed={collapsed} />

            <Layout
                className="transition-all duration-300 bg-[#fcfcfc]"
                style={{ marginLeft: collapsed ? 80 : 260 }}
            >
                <div className="sticky top-0 z-40 p-4 bg-white/80 backdrop-blur-md flex items-center border-b border-gray-100 justify-between">
                    <Button
                        type="text"
                        icon={collapsed ? <MdMenu size={20} /> : <MdMenuOpen size={20} />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-lg hover:bg-gray-100"
                    />
                    <div className="flex items-center gap-4 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Admin Mode
                        </span>
                        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">
                            {user.first_name?.[0]?.toUpperCase() ?? "A"}
                        </div>
                    </div>
                </div>

                <Content className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}