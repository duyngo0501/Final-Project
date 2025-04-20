import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Spin,
  Alert,
  Typography,
  Image,
  Space,
  Descriptions,
} from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import dayjs from "dayjs";

const { Text, Title, Paragraph } = Typography;

// --- Data Types ---
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  key: string;
  id: string;
  orderDate: string;
  totalAmount: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
}

// --- Mock Data ---
const mockOrders: Order[] = [
  {
    key: "1",
    id: "ORD-12345",
    orderDate: "2024-03-10T10:30:00Z",
    totalAmount: 129.98,
    status: "Delivered",
    items: [
      { id: 101, name: "Galactic Conquest", quantity: 1, price: 59.99 },
      { id: 102, name: "Cyberpunk Runner", quantity: 1, price: 69.99 },
    ],
  },
  {
    key: "2",
    id: "ORD-67890",
    orderDate: "2024-04-22T14:00:00Z",
    totalAmount: 79.99,
    status: "Shipped",
    items: [{ id: 201, name: "Space Sim X", quantity: 1, price: 79.99 }],
  },
  {
    key: "3",
    id: "ORD-11223",
    orderDate: "2024-05-01T09:15:00Z",
    totalAmount: 19.99,
    status: "Processing",
    items: [{ id: 301, name: "Indie Puzzle Game", quantity: 1, price: 19.99 }],
  },
  {
    key: "4",
    id: "ORD-44556",
    orderDate: "2023-12-15T11:00:00Z",
    totalAmount: 29.99,
    status: "Cancelled",
    items: [{ id: 401, name: "Strategy Arena", quantity: 1, price: 29.99 }],
  },
];

// --- Mock API Call ---
/**
 * @description Simulates fetching the user's order history.
 * @returns {Promise<Order[]>} A promise that resolves with an array of mock orders.
 */
const mockFetchOrders = async (): Promise<Order[]> => {
  console.log("[Mock API] Fetching order history...");
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
  // Simulate potential error
  // if (Math.random() > 0.8) {
  //   throw new Error("Failed to fetch orders due to a simulated network error.");
  // }
  return mockOrders;
};

// --- Component ---

/**
 * @description Displays the user's order history in a table with expandable rows for item details.
 * Fetches mock order data on mount.
 * @returns {React.ReactElement} The rendered OrderHistory component.
 */
const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await mockFetchOrders();
        setOrders(fetchedOrders);
      } catch (err: any) {
        console.error("Failed to fetch order history:", err);
        setError(
          err.message || "Could not load order history. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return "green";
      case "Shipped":
        return "blue";
      case "Processing":
        return "orange";
      case "Cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // --- Table Columns Definition ---
  const columns: TableProps<Order>["columns"] = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a, b) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
      defaultSortOrder: "descend",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Order["status"]) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: "Processing", value: "Processing" },
        { text: "Shipped", value: "Shipped" },
        { text: "Delivered", value: "Delivered" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  // --- Expanded Row Render Function ---
  const expandedRowRender = (record: Order) => {
    const itemColumns: TableProps<OrderItem>["columns"] = [
      { title: "Item", dataIndex: "name", key: "name" },
      { title: "Quantity", dataIndex: "quantity", key: "quantity" },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (price: number) => `$${price.toFixed(2)}`,
      },
      {
        title: "Subtotal",
        key: "subtotal",
        render: (_, item) => `$${(item.quantity * item.price).toFixed(2)}`,
      },
    ];

    return (
      <Table
        columns={itemColumns}
        dataSource={record.items}
        pagination={false}
        size="small"
        rowKey="id"
      />
    );
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading orders"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="key"
        expandable={{ expandedRowRender }}
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20"],
        }}
        bordered
      />
    </div>
  );
};

export default OrderHistory;
