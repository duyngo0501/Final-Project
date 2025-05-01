import React from 'react';
import { Spin, Alert, Descriptions, Table, Typography, Image, Tag } from 'antd';
// Assume the hook for fetching order details exists or will be generated
import { useOrderControllerGetOrderDetails } from '@/gen/query/OrdersHooks/useOrderControllerGetOrderDetails'; // Adjust path/name if needed
// Import the OrderResponse type if available (adjust path/name)
import type { OrderResponse, OrderItemResponse } from '@/gen/types'; // Adjust path/name if needed

const { Text } = Typography;

interface OrderDetailViewProps {
  orderId: string;
}

/**
 * @description Fetches and displays detailed information for a specific order.
 * @param {OrderDetailViewProps} props Component props.
 * @returns {React.ReactElement} The rendered order details view.
 */
const OrderDetailView: React.FC<OrderDetailViewProps> = ({ orderId }) => {
  // Fetch order details using the specific hook for the orderId
  const {
    data: orderResponse, // Renamed to avoid conflict with OrderResponse type if imported
    isLoading,
    error,
  } = useOrderControllerGetOrderDetails(orderId, {
    // TanStack Query options can go here if needed
    // enabled: !!orderId, // Ensure it only runs when orderId is valid
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    // Basic error handling, can be enhanced
    return (
      <Alert
        message="Error Loading Order Details"
        description={
          error instanceof Error ? error.message : 'Could not load order details.'
        }
        type="error"
        showIcon
      />
    );
  }

  // Type assertion or validation if OrderResponse type is available
  const order: OrderResponse | undefined | null = orderResponse?.data;

  if (!order) {
    return <Alert message="Order data not found." type="warning" showIcon />;
  }

  // Define columns for the order items table
  const itemColumns = [
    {
      title: 'Game',
      dataIndex: 'game',
      key: 'game',
      render: (game: OrderItemResponse['game']) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src={game?.background_image || '/placeholder-image.png'}
            alt={game?.name || 'Game image'}
            width={50}
            style={{ marginRight: 10 }}
            preview={false}
          />
          <Text>{game?.name || 'Unknown Game'}</Text>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const, // Align center
    },
    {
      title: 'Price Paid',
      dataIndex: 'price_at_purchase',
      key: 'price',
      align: 'right' as const, // Align right
      render: (price: number) => <Text>${price?.toFixed(2)}</Text>,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      align: 'right' as const, // Align right
      render: (_: any, record: OrderItemResponse) => (
        <Text strong>
          ${(record.quantity * record.price_at_purchase).toFixed(2)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Descriptions bordered column={1} size="small" layout="horizontal">
        <Descriptions.Item label="Order ID">
          <Text copyable>{order.id}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Order Date">
          {new Date(order.order_date).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Customer Email">
          {order.customer_email}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag
             color={
               order.status === "delivered"
                 ? "green"
                 : order.status === "cancelled"
                   ? "red"
                   : "blue"
             }
             style={{ textTransform: "capitalize" }}
           >
            {order.status}
           </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <Text strong>${order.total_amount?.toFixed(2)}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Typography.Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
        Items in Order
      </Typography.Title>

      <Table
        columns={itemColumns}
        dataSource={order.order_items || []}
        rowKey="id" // Use item id as key
        pagination={false} // Disable pagination for items within a single order
        size="small"
      />
    </div>
  );
};

export default OrderDetailView; 