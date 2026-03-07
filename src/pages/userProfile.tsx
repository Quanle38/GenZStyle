import { useState } from "react";
import { Tabs, Modal, Input, message } from "antd";
import { UserOutlined, LockOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { SecurityTab } from "../components/securityTab";
import { UserProfileTab } from "../components/userProfileTab";
import { AddressTab } from "../components/addressTab"; // Component mới tạo

export default function UserProfile() {
    // Quản lý lỗi cho tab Profile và Security
    const [errorPass, setErrorPass] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Quản lý Modal OTP cho tab Security
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const handleOtpSubmit = () => {
        if (otpValue.length === 6) {
            message.success("OTP verified! ✅");
            setOtpModalOpen(false);
            setOtpValue("");
            // TODO: Gửi OTP xuống backend để thực hiện đổi mật khẩu
        } else {
            message.error("Please enter 6 digits OTP!");
        }
    };

    // Định nghĩa nội dung các Tabs
    const profileTab = (
        <UserProfileTab errors={errors} setErrors={setErrors} key="profile-content" />
    );

    const securityTab = (
        <SecurityTab 
            errorPass={errorPass} 
            setErrorPass={setErrorPass} 
            setOtpModalOpen={setOtpModalOpen} 
            key="security-content" 
        />
    );

    const addressTab = (
        <AddressTab key="address-content" />
    );

    return (
        <div
            className={`dark bg-gradient-to-r from-indigo-800 to-blue-900 min-h-screen flex items-center justify-center p-4`}
        >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-8 transition-all duration-300 animate-fade-in">
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            key: "1",
                            label: (
                                <span>
                                    <UserOutlined /> User Profile
                                </span>
                            ),
                            children: profileTab,
                        },
                        {
                            key: "2",
                            label: (
                                <span>
                                    <LockOutlined /> Security
                                </span>
                            ),
                            children: securityTab,
                        },
                        {
                            key: "3",
                            label: (
                                <span>
                                    <EnvironmentOutlined /> Address
                                </span>
                            ),
                            children: addressTab,
                        },
                    ]}
                    rootClassName="custom-tabs"
                />
            </div>

            {/* OTP Modal (Dùng chung cho logic bảo mật) */}
            <Modal
                title="Enter OTP"
                open={otpModalOpen}
                onOk={handleOtpSubmit}
                onCancel={() => setOtpModalOpen(false)}
                okText="Verify"
                centered
            >
                <div className="text-center py-4">
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                        Please enter the 6-digit OTP sent to your email to confirm password changes.
                    </p>
                    <Input.OTP
                        length={6}
                        value={otpValue}
                        onChange={(val) => setOtpValue(val)}
                        size="large"
                    />
                </div>
            </Modal>
        </div>
    );
}