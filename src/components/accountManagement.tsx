import React, { useEffect } from "react"; // 1. Import useEffect
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Avatar, 
  message, 
  Popconfirm,
} from "antd";
import { useDispatch, useSelector } from "react-redux"; // 2. Import hooks Redux
import {type AppDispatch, type RootState } from "../app/store"; // Đường dẫn store của bạn
import { getAllUsersThunk } from "../features/user/userSlice"; // Đường dẫn slice của bạn

import { MdSearch, MdAdd, MdEdit, MdDeleteForever, MdPerson } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import type { ColumnsType } from "antd/es/table";
import type { UserProfile } from "../features/user/userTypes"; // Dùng type từ slice

export const AccountManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // 3. Lấy dữ liệu từ Redux Store
  const { users, isLoading, error } = useSelector((state: RootState) => state.user);

  // 4. Gọi API khi component lần đầu hiển thị
  useEffect(() => {
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  // Hiển thị thông báo lỗi nếu có
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleDelete = (id: string) => {
    // Logic delete của bạn (nên viết thêm deleteThunk)
    message.warning("Chức năng xóa cần được kết nối với API delete");
  };

  // 5. Cập nhật kiểu dữ liệu cho Columns thành UserProfile
  const columns: ColumnsType<UserProfile> = [
    {
      title: "User Info",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar 
            src={record.avatar} 
            icon={<MdPerson size={20} />} 
            className="border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400"
          />
          <div>
            <div className="font-bold text-sm text-black uppercase tracking-tight leading-none">
              {record.first_name} {record.last_name}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">{record.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-gray-500 text-sm">{text}</span>,
    },
    {
      title: "Gender", // Thay đổi từ Role sang Gender (theo UserProfile) hoặc giữ nguyên nếu API trả về Role
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (
        <Tag className="rounded-none font-bold text-[10px] border-none px-3 py-0.5 bg-gray-100 text-gray-600">
          {gender}
        </Tag>
      ),
    },
    {
        title: "Membership",
        dataIndex: "membership_id",
        key: "membership_id",
        render: (level) => (
          <Tag color={level === 'GOLD' ? 'gold' : level === 'SILVER' ? 'blue' : 'default'}>
            {level}
          </Tag>
        )
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            className="flex items-center justify-center hover:bg-gray-100 rounded-none"
            icon={<MdEdit size={18} className="text-gray-400 hover:text-black transition-colors" />} 
          />
          <Popconfirm
            title="Delete User"
            description="Proceed with deletion?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button 
              type="text" 
              danger 
              className="flex items-center justify-center rounded-none"
              icon={<MdDeleteForever size={20} />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-1 leading-none">
            Accounts
          </h2>
          <div className="h-1 w-12 bg-black mt-2"></div>
        </div>
        
        <div className="flex gap-2">
          <Input
            prefix={<MdSearch size={20} className="text-gray-400 mr-1" />}
            placeholder="Search email, name..."
            className="rounded-none border-gray-200 w-64 h-10"
          />
          <Button icon={<FiFilter size={16} />} className="rounded-none h-10 px-3" />
          <Button 
            type="primary"
            icon={<MdAdd size={20} />} 
            className="rounded-none bg-black text-white h-10 px-6 uppercase text-[11px] font-bold"
          >
            New User
          </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-100">
        <Table
          columns={columns}
          dataSource={users} // 6. Dùng dữ liệu từ Redux
          loading={isLoading} // 7. Thêm hiệu ứng loading tự động từ store
          rowKey="id"
          pagination={{ 
            pageSize: 7,
            showSizeChanger: false,
            className: "px-4"
          }}
          className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-[10px] [&_.ant-table-thead_th]:!font-black [&_.ant-table-thead_th]:!uppercase"
        />
      </div>
    </div>
  );
};