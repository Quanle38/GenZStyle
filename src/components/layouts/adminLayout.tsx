import { MdMenu, MdMenuOpen } from "react-icons/md";
import { Button, Layout } from "antd";
import { useState } from "react";

import { Outlet } from "react-router-dom";
import AdminSideBar from "./adminSideBar";

const { Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen bg-white">
      {/* SIDEBAR */}
      <AdminSideBar collapsed={collapsed} />

      {/* CONTENT */}
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
              A
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