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

const { Content } = Layout;
const { Title } = Typography;

/**
 * @description Admin page for viewing and managing users.
 * @returns {React.FC} The AdminUsersPage component.
 */
const AdminUsersPage: React.FC = () => {
  // Mock fetching state
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<Error | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);

  // Modal and Form state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm(); // Form instance for modal

  // Placeholder handlers for CRUD actions
  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditingUser(user);
    // Note: UserForm's useEffect handles setting form values excluding password
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  /**
   * @description Handles the submission of the UserForm (Add or Edit).
   * @param {UserFormValues} values Form values from UserForm.
   */
  const handleFormSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    const isEditing = !!editingUser?.id;
    const userData = { ...values, id: editingUser?.id || Date.now() }; // Assign ID for mock
    console.log("Submitting User:", userData);

    try {
      // --- Mock API Call --- (Replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (isEditing) {
        console.log("[Mock API] Updating user:", userData);
        setUsers((prev) =>
          prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u))
        );
        message.success(`User '${userData.username}' updated successfully!`);
      } else {
        console.log("[Mock API] Adding new user:", userData);
        setUsers((prev) => [...prev, userData as User]); // Add new user (cast needed for mock ID)
        message.success(`User '${userData.username}' added successfully!`);
      }
      // --- End Mock API Call ---

      setIsModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error: any) {
      console.error("Failed to save user:", error);
      message.error(error.message || "Failed to save user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    Modal.confirm({
      title: `Delete User: ${user.username}?`,
      content:
        "Are you sure you want to delete this user? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setIsSubmitting(true); // Use submitting flag for feedback
          console.log("[Mock API] Deleting user:", user.id);
          await new Promise((resolve) => setTimeout(resolve, 500));
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== user.id));
          message.success(`User '${user.username}' deleted successfully!`);
        } catch (error: any) {
          console.error("Failed to delete user:", error);
          message.error(error.message || "Failed to delete user.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  // Define table columns
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
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value: any, record) => record.role === value,
      render: (role: string) => (
        <Tag color={role === "admin" ? "volcano" : "geekblue"}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center" as const,
      render: (_, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
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
            Manage Users
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add New User
          </Button>
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
          dataSource={users}
          rowKey="id"
          loading={isLoading}
          bordered
        />

        {/* Add/Edit User Modal */}
        <Modal
          title={
            editingUser?.id
              ? `Edit User: ${editingUser.username}`
              : "Add New User"
          }
          visible={isModalVisible}
          onCancel={handleCancel}
          confirmLoading={isSubmitting}
          onOk={() => form.submit()} // Trigger form submission via internal button
          destroyOnClose
        >
          <UserForm
            formInstance={form}
            initialValues={editingUser || undefined}
            isEditing={!!editingUser?.id}
            onFinish={handleFormSubmit}
            isLoading={isSubmitting}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminUsersPage;
