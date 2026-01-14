import { useState } from "react";
import { Tabs, Modal, Input, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { SecurityTab } from "../components/securityTab";
import { UserProfileTab } from "../components/userProfileTab";


export default function UserProfile() {

    const [errorPass, setErrorPass] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpValue, setOtpValue] = useState("");

    const handleOtpSubmit = () => {
        if (otpValue.length === 6) {
            message.success("OTP verified! ✅");
            setOtpModalOpen(false);
            setOtpValue("");
            // TODO: gửi OTP xuống backend để verify
        } else {
            message.error("Please enter 6 digits OTP!");
        }
    };

    const profileTab = (
        <UserProfileTab errors={errors} setErrors={setErrors} key={2} />
    )

    const securityTab = (
        <SecurityTab errorPass={errorPass} setErrorPass={setErrorPass} setOtpModalOpen={setOtpModalOpen} key={1} />
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
                    ]}
                    rootClassName="custom-tabs"
                />
            </div>

            {/* OTP Modal */}
            <Modal
                title="Enter OTP"
                open={otpModalOpen}
                onOk={handleOtpSubmit}
                onCancel={() => setOtpModalOpen(false)}
                okText="Verify"
            >
                <p className="mb-4">Please enter the 6-digit OTP sent to your email.</p>
                <Input.OTP
                    length={6}
                    value={otpValue}
                    onChange={(val) => setOtpValue(val)}
                    size="large"
                />
            </Modal>
        </div>
    );
}
