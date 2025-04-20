import React from "react";
import { Layout, Typography, Table, Tag } from "antd";

const { Content } = Layout;
const { Title } = Typography;

// Placeholder data structure for orders
interface Order {
  id: string | number;
  customer: string;
  date: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  total: number;
}

// Placeholder data
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "user1@example.com",
    date: "2023-10-27",
    status: "Delivered",
    total: 74.98,
  },
  {
    id: "ORD-002",
    customer: "user2@testing.com",
    date: "2023-10-28",
    status: "Shipped",
    total: 14.99,
  },
  {
    id: "ORD-003",
    customer: "user1@example.com",
    date: "2023-10-29",
    status: "Processing",
    total: 104.97,
  },
];

/**
 * @description Placeholder admin page for viewing orders.
 * @returns {React.FC} The AdminOrdersPage component.
 */
const AdminOrdersPage: React.FC = () => {
  const columns = [
    { title: "Order ID", dataIndex: "id", key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "geekblue";
        if (status === "Delivered") color = "green";
        if (status === "Shipped") color = "cyan";
        if (status === "Processing") color = "processing";
        if (status === "Cancelled") color = "red";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    // TODO: Add Actions column (View Details)
  ];

  return (
    <Layout>
      <Content>
        <Title level={3} style={{ marginBottom: 16 }}>
          Manage Orders
        </Title>
        {/* Add filtering/search options here later */}
        <Table
          columns={columns}
          dataSource={mockOrders}
          rowKey="id"
          bordered
          // TODO: Add loading state when API is implemented
        />
      </Content>
    </Layout>
  );
};

export default AdminOrdersPage;
