import {
    AppstoreOutlined,
    CreditCardOutlined,
    LogoutOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    ShoppingCartOutlined,
    SkinOutlined,
    TagsOutlined,
    ToolOutlined,
    UserOutlined,
    DashboardOutlined
} from "@ant-design/icons";
import { Menu, type MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { useNavigate } from 'react-router-dom';

interface IAdminSideBarProp {
    collapsed : boolean
}

export default function AdminSideBar({collapsed} : IAdminSideBarProp) {

    const navigate = useNavigate(); 
    const menuItems: MenuProps["items"] = [
        {
            key: "overview",
            icon: <DashboardOutlined />,
            label: "Overview",
            onClick: () => navigate("/admin"),
        },
        {
            key: "management",
            icon: <AppstoreOutlined />,
            label: "Management",
            children: [
                {
                    key: "account",
                    icon: <UserOutlined />,
                    label: "Account",
                    onClick: () => navigate("/admin/account")
                },
                {
                    key: "coupon",
                    icon: <TagsOutlined />,
                    label: "Coupon",
                    onClick: () => navigate("/admin/coupon")
                },
                {
                    key: "order",
                    icon: <ShoppingCartOutlined />,
                    label: "Order",
                    onClick: () => navigate("/admin/order")
                },
                {
                    key: "product",
                    icon: <SkinOutlined />,
                    label: "Product",
                    onClick: () => navigate("/admin/product")
                },
                {
                    key: "payment",
                    icon: <CreditCardOutlined />,
                    label: "Payment",
                    onClick: () => navigate("/admin/payment")
                },
            ],
        },
        {
            key: "configuration",
            icon: <SettingOutlined />,
            label: "Configuration",
            children: [
                {
                    key: "system",
                    icon: <ToolOutlined />,
                    label: "System Setup",
                    onClick: () => navigate("/admin/system")
                },
                {
                    key: "security",
                    icon: <SafetyCertificateOutlined />,
                    label: "Security",
                    onClick: () => navigate("/admin/security")
                },
            ],
        },
        {
            type: "divider",
            className: "my-4",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            className: "text-red-500 hover:text-red-600",
            onClick: () => navigate("/login")
        },
    ];
    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            className="border-r border-gray-100 shadow-sm fixed h-full z-50 left-0 top-0 bottom-0"
            width={260}
        >
            <div className="p-8 flex items-center justify-center border-b border-gray-50">
                <h1 className={`font-black text-xl tracking-tighter transition-all duration-300 ${collapsed ? "scale-0 w-0" : "scale-100"}`}>
                    GENZ<span className="text-gray-400 font-light">STYLE</span>
                </h1>
            </div>

            <Menu
                mode="inline"
                defaultSelectedKeys={["overview"]}
                defaultOpenKeys={["management"]}
                className="border-none px-3 mt-4"
                items={menuItems}
                inlineIndent={24}
            />
        </Sider>
    );
}
