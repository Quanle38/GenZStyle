/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { Modal, Input, Switch, Button, message } from "antd";
import { MdDeleteForever } from "react-icons/md";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";

import {
    getAllAddressThunk,
    createAddressThunk,
    updateAddressThunk,
    deleteAddressThunk,
} from "../features/address/addressSlice";

import type { UserAddress } from "../features/address/addressType";

export function AddressTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading } = useSelector((state: RootState) => state.address);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Partial<UserAddress> | null>(null);

    const [editId, setEditId] = useState<number | null>(null);

    /* ================= LOAD LIST ================= */
    useEffect(() => {
        dispatch(getAllAddressThunk());
    }, [dispatch]);

    /* ================= MODAL OPEN ================= */
    const openAdd = () => {
        setEditingAddress({
            label: "",
            full_address: "",
            is_default: false,
        });
        setEditId(null);
        setIsModalOpen(true);
    };

    const openEdit = (addr: UserAddress) => {
        setEditingAddress({ ...addr });
        setEditId(addr.address_id);
        setIsModalOpen(true);
    };

    /* ================= SAVE HANDLER ================= */
    const handleSave = async () => {
        if (!editingAddress?.label || !editingAddress?.full_address) {
            return message.error("Please fill all fields");
        }

        try {
            if (editId) {
                // UPDATE
                await dispatch(
                    updateAddressThunk({ addressId: editId, body: editingAddress })
                ).unwrap();
                message.success("Address updated");
            } else {
                // CREATE
                await dispatch(createAddressThunk(editingAddress)).unwrap();
                message.success("Address created");
            }

            setIsModalOpen(false);
        } catch (err) {
            message.error("Something went wrong");
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();

        try {
            await dispatch(deleteAddressThunk(id)).unwrap();
            message.success("Deleted");
        } catch (err) {
            message.error("Delete failed");
        }
    };

    return (
        <div className="p-4 space-y-4">
            {/* Header */}
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

            {/* LIST */}
            <div className="grid gap-4">
                {loading && <p>Loading...</p>}

                {!loading && list.length === 0 && (
                    <p className="text-gray-500 italic">No address found</p>
                )}

                {list.map((item) => (
                    <div
                        key={item.address_id}
                        onClick={() => openEdit(item)}
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
                            onClick={(e) => handleDelete(e, item.address_id)}
                            className="text-2xl text-gray-400 hover:text-red-500 transition-colors duration-300 p-2"
                        >
                            <MdDeleteForever />
                        </button>
                    </div>
                ))}
            </div>

            {/* MODAL */}
            <Modal
                title={editId ? "Edit Address" : "Add New Address"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        className="bg-indigo-600"
                        onClick={handleSave}
                    >
                        Save Address
                    </Button>,
                ]}
            >
                <div className="space-y-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Label</label>
                        <Input
                            placeholder="Ex: Nhà riêng, Công ty…"
                            value={editingAddress?.label}
                            onChange={(e) =>
                                setEditingAddress((prev) => ({ ...prev!, label: e.target.value }))
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <Input.TextArea
                            placeholder="Enter detailed address"
                            rows={3}
                            value={editingAddress?.full_address}
                            onChange={(e) =>
                                setEditingAddress((prev) => ({
                                    ...prev!,
                                    full_address: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Set as default</span>
                        <Switch
                            checked={editingAddress?.is_default}
                            onChange={(checked) =>
                                setEditingAddress((prev) => ({
                                    ...prev!,
                                    is_default: checked,
                                }))
                            }
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}