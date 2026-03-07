import { useState } from "react";
import { Modal, Input, Switch, Button, message } from "antd";
import { MdDeleteForever } from "react-icons/md";
import { PlusOutlined } from "@ant-design/icons";

interface AddressItem {
    full_address: string;
    is_default: boolean;
    label: string;
}

export function AddressTab() {
    const [addresses, setAddresses] = useState<AddressItem[]>([
        {
            full_address: "123 Lê Lợi, Quận 1, TP.HCM",
            is_default: true,
            label: "Cơ Quan",
        },
        {
            full_address: "Số 123, đường Nguyễn Huệ, Quận 1, TP. HCM",
            is_default: false,
            label: "Nhà riêng",
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
    const [editIndex, setEditIndex] = useState<number | null>(null); // null means adding new

    // Open Modal for Adding New
    const openAdd = () => {
        setEditingAddress({
            full_address: "",
            is_default: false,
            label: "",
        });
        setEditIndex(null);
        setIsModalOpen(true);
    };

    // Open Modal for Editing
    const openEdit = (item: AddressItem, index: number) => {
        setEditingAddress({ ...item });
        setEditIndex(index);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!editingAddress) return;
        
        if (!editingAddress.label || !editingAddress.full_address) {
            message.error("Please fill in all required fields!");
            return;
        }

        let newAddresses = [...addresses];

        // If this address is set to default, unset others
        if (editingAddress.is_default) {
            newAddresses = newAddresses.map(addr => ({ ...addr, is_default: false }));
        }

        if (editIndex !== null) {
            // Update existing
            newAddresses[editIndex] = editingAddress;
            message.success("Address updated successfully!");
        } else {
            // Add new
            newAddresses.push(editingAddress);
            message.success("New address added successfully!");
        }

        setAddresses(newAddresses);
        setIsModalOpen(false);
    };

    const handleDelete = (e: React.MouseEvent, index: number) => {
        e.stopPropagation();
        const newAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(newAddresses);
        message.info("Address deleted");
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header with Title and Add Button */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-indigo-800 dark:text-white">
                    My Addresses
                </h2>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    className="bg-indigo-600 hover:bg-indigo-700 flex items-center"
                    onClick={openAdd}
                >
                    New Address
                </Button>
            </div>

            <div className="grid gap-4">
                {addresses.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => openEdit(item, index)}
                        className="relative flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 transition-all group"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center">
                                <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    {item.label}
                                </span>
                                {item.is_default && (
                                    <span className="ml-2 border border-gray-400 text-gray-500 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                                        DEFAULT
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 italic text-sm">
                                {item.full_address}
                            </p>
                        </div>

                        <button 
                            onClick={(e) => handleDelete(e, index)}
                            className="text-2xl text-gray-400 hover:text-red-500 transition-colors duration-300 p-2"
                        >
                            <MdDeleteForever />
                        </button>
                    </div>
                ))}
            </div>

            <Modal
                title={editIndex !== null ? "Edit Address" : "Add New Address"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button key="save" type="primary" className="bg-indigo-600" onClick={handleSave}>
                        Save Address
                    </Button>,
                ]}
            >
                <div className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Label (e.g., Nhà riêng, Công ty...)</label>
                        <Input 
                            placeholder="Enter label name"
                            value={editingAddress?.label} 
                            onChange={e => setEditingAddress(prev => prev ? {...prev, label: e.target.value} : null)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <Input.TextArea 
                            placeholder="Enter detailed address"
                            rows={3}
                            value={editingAddress?.full_address} 
                            onChange={e => setEditingAddress(prev => prev ? {...prev, full_address: e.target.value} : null)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Set as default address</span>
                        <Switch 
                            checked={editingAddress?.is_default} 
                            onChange={checked => setEditingAddress(prev => prev ? {...prev, is_default: checked} : null)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}