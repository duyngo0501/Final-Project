import React, { useState } from "react";
import {
  Layout,
  Table,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Row,
  Modal,
  Tag,
  Form,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import UserForm, { UserFormValues } from "@/components/admin/UserForm";

// TODO: Define User type more robustly, potentially import from a types file or API definition
interface User {
  id: string | number;
  username: string;
  email: string;
  role: "admin" | "user"; // Example roles
}

// TODO: Replace with actual API hook for admin user fetching
const mockUsers: User[] = [
  { id: 1, username: "AdminUser", email: "admin@example.com", role: "admin" },
  { id: 2, username: "RegularUser1", email: "user1@example.com", role: "user" },
  { id: 3, username: "AnotherUser", email: "user2@testing.com", role: "user" },
  {
    id: 4,
    username: "TestAdmin",
    email: "test.admin@example.com",
    role: "admin",
  },
];

// Filter mock data to only show admins
const adminUsers = mockUsers.filter(user => user.role === 'admin');

const { Content } = Layout;
const { Title } = Typography;

/**
 * @description Admin page for viewing admin users.
 * @returns {React.FC} The AdminUsersPage component.
 */
const AdminUsersPage: React.FC = () => {
  // Mock fetching state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  // Initialize state with only admin users
  const [users, setUsers] = useState<User[]>(adminUsers);

  // Remove Modal and Form state
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [form] = Form.useForm(); // Form instance for modal

  // Remove Placeholder handlers for CRUD actions
  // const showAddModal = () => { ... };
  // const showEditModal = (user: User) => { ... };
  // const handleCancel = () => { ... };
  // const handleFormSubmit = async (values: UserFormValues) => { ... };
  // const handleDeleteUser = (user: User) => { ... };

  // Define table columns - Remove the 'Actions' column
  const columns: ColumnsType<User> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) =>
        typeof a.id === "number" && typeof b.id === "number"
          ? a.id - b.id
          : String(a.id).localeCompare(String(b.id)),
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      // Keep filters if you want to filter within admins, otherwise remove
      // filters: [
      //   { text: "Admin", value: "admin" },
      // ],
      // onFilter: (value: any, record) => record.role === value,
      render: (role: string) => (
        <Tag color={role === "admin" ? "volcano" : "geekblue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    // Remove Actions column definition
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 150,
    //   align: "center" as const,
    //   render: (_, record: User) => (
    //     <Space size="middle">
    //       <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
    //         Edit
    //       </Button>
    //       <Button
    //         danger
    //         icon={<DeleteOutlined />}
    //         onClick={() => handleDeleteUser(record)}
    //       >
    //         Delete
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <Layout>
      <Content>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Admin Accounts
          </Title>
          {/* Remove Add New User button */}
          {/* <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}> */}
          {/*   Add New User */}
          {/* </Button> */}
        </Row>

        {isError && (
          <Alert
            message="Error loading users"
            description={isError.message || "Failed to fetch user data."}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={users} // Now contains only admins
          rowKey="id"
          loading={isLoading}
          bordered
        />

        {/* Remove Add/Edit User Modal */}
        {/* <Modal ... /> */}
      </Content>
    </Layout>
  );
};

export default AdminUsersPage;
