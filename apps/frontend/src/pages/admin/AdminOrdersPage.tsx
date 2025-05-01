import React, { useState, useMemo } from "react";
import {
  Layout,
  Table,
  Typography,
  Spin,
  Alert,
  Row,
  // Modal, // Add later if needed for actions
  // message, // Add later if needed for actions
  // Button, // Add later if needed for actions
  // Space, // Add later if needed for actions
} from "antd";
// import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Add later for actions
import { OrderSummary, OrderListResponse } from "@/gen/types"; // Adjust path if needed
import { type OrderControllerListOrdersQueryParams } from "@/gen/types/OrderControllerListOrders"; // Adjust path if needed
// Revert to the hook name that actually exists after generation
import { useOrderControllerListOrders } from "@/gen/query/OrdersHooks"; // Use the existing hook name
// import { useOrderControllerListAllOrdersAdmin } from "@/gen/query/OrdersHooks"; // This name doesn't exist
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";

const { Content } = Layout;
const { Title } = Typography;

/**
 * @description Admin page for viewing and managing orders.
 * @returns {React.FC} The AdminOrdersPage component.
 */
const AdminOrdersPage: React.FC = () => {
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
  });
  const [sorter, setSorter] = useState<SorterResult<OrderSummary>>({});

  // --- Derive API Query Params ---
  const apiQueryParams = useMemo(() => {
    const params: OrderControllerListOrdersQueryParams = {
      skip: pagination.current
        ? (pagination.current - 1) * (pagination.pageSize ?? 10)
        : 0,
      limit: pagination.pageSize ?? 10,
    };
    // Handle sorting - map AntD sorter to API params
    if (sorter.field && sorter.order) {
      // Assuming API uses 'sort_by' and 'is_asc' like games endpoint
      // Adjust field names if the Order API uses different ones
      params.sort_by = String(sorter.field); // Convert keyof OrderSummary to string
      // Correctly use sort_order based on type definition
      params.sort_order = sorter.order === "ascend" ? "asc" : "desc";
    }

    return params;
  }, [pagination, sorter]);

  // --- Fetch Orders using the available Hook ---
  const {
    data: response,
    error: fetchError,
    isLoading,
    // mutate, // Add later if needed for actions
  } = useOrderControllerListOrders(apiQueryParams, {
    query: {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  });

  // --- Process API Response ---
  const { orders, total } = useMemo(() => {
    const items: OrderSummary[] = response?.data?.items ?? [];
    const totalCount: number = response?.data?.total ?? 0;
    return { orders: items, total: totalCount };
  }, [response]);

  // --- Table Columns Definition ---
  const columns: ColumnsType<OrderSummary> = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      sorter: true,
      render: (id: string) => <code>{id.substring(0, 8)}...</code>, // Shorten UUID
    },
    {
      title: "Order Date",
      dataIndex: "order_date",
      key: "order_date",
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString(),
      defaultSortOrder: "descend",
    },
    {
      title: "Customer Email",
      dataIndex: "customer_email",
      key: "customer_email",
      sorter: true,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: true,
      render: (amount: number) => `$${amount.toFixed(2)}`, // Format currency
    },
    {
      title: "Item Count",
      dataIndex: "item_count",
      key: "item_count",
      sorter: false, // Usually not useful to sort by count
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      // TODO: Add tag/color based on status
    },
    // { // Placeholder for actions column
    //   title: 'Actions',
    //   key: 'actions',
    //   align: 'center' as const,
    //   render: (_: any, record: OrderSummary) => (
    //     <Space size="small">
    //       <Button size="small">View</Button>
    //       {/* Add Edit/Update Status later */}
    //     </Space>
    //   ),
    // },
  ];

  // --- Table Change Handler ---
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    // Use the correct FilterValue type from antd
    filters: Record<string, FilterValue | null>,
    newSorter: SorterResult<OrderSummary> | SorterResult<OrderSummary>[] // Can be array
  ) => {
    setPagination(newPagination);
    // Handle single or multiple sorters (take the first if multiple)
    setSorter(Array.isArray(newSorter) ? newSorter[0] : newSorter);
  };

  return (
    <Layout style={{ padding: 16 }}>
      <Content>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Manage Orders
          </Title>
          {/* Add Filter/Create buttons later if needed */}
        </Row>

        {fetchError && (
          <Alert
            message="Error loading orders"
            description={
              fetchError instanceof Error
                ? fetchError.message
                : "Failed to fetch order data."
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table<OrderSummary> // Explicitly type the Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{ ...pagination, total }}
          onChange={handleTableChange}
          bordered
          size="middle"
        />
      </Content>
    </Layout>
  );
};

export default AdminOrdersPage;
