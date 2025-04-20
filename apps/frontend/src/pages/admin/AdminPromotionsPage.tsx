import React, { useState, useMemo } from "react";
import {
  Layout,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Form,
} from "antd";
import PromotionForm, {
  PromotionFormValues,
} from "@/components/admin/promotions/PromotionForm";
import dayjs, { Dayjs } from "dayjs";

const { Content } = Layout;
const { Title } = Typography;

/**
 * @description Interface for a Promotion object.
 */
interface Promotion {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string; // ISO string format
  endDate: string; // ISO string format
  status: "active" | "inactive" | "expired";
  description?: string;
}

// Mock data for promotions
const mockPromotions: Promotion[] = [
  {
    id: "promo1",
    code: "SUMMER20",
    discountType: "percentage",
    discountValue: 20,
    startDate: "2024-06-01T00:00:00Z",
    endDate: "2024-08-31T23:59:59Z",
    status: "active",
    description: "20% off all summer items.",
  },
  {
    id: "promo2",
    code: "FALLSALE10",
    discountType: "fixed",
    discountValue: 10,
    startDate: "2024-09-15T00:00:00Z",
    endDate: "2024-10-15T23:59:59Z",
    status: "inactive",
    description: "$10 off orders over $50.",
  },
  {
    id: "promo3",
    code: "HOLIDAY50",
    discountType: "percentage",
    discountValue: 50,
    startDate: "2023-11-20T00:00:00Z",
    endDate: "2023-12-31T23:59:59Z",
    status: "expired",
  },
];

// Define the combined type for initial values including the optional dateRange
type PromotionInitialValues = Partial<
  PromotionFormValues & { dateRange?: [Dayjs, Dayjs] }
>;

/**
 * @description Admin page for managing promotions.
 * @returns {React.FC} The AdminPromotionsPage component.
 */
const AdminPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [form] = Form.useForm<PromotionFormValues>();

  /**
   * @description Prepares initial values for the form based on editing state.
   */
  const initialFormValues: PromotionInitialValues | undefined = useMemo(() => {
    if (editingPromotion) {
      // Construct the object explicitly with only the fields needed by the form
      const values: PromotionInitialValues = {
        code: editingPromotion.code,
        description: editingPromotion.description,
        discountType: editingPromotion.discountType,
        discountValue: editingPromotion.discountValue,
        status:
          editingPromotion.status === "expired"
            ? "inactive"
            : editingPromotion.status,
        dateRange: [
          dayjs(editingPromotion.startDate),
          dayjs(editingPromotion.endDate),
        ],
      };
      return values;
    }
    // Default values for adding a new promotion, explicitly typed
    return {
      code: "",
      discountType: "percentage",
      status: "inactive",
      discountValue: 0,
    };
  }, [editingPromotion]);

  /**
   * @description Opens the modal for adding a new promotion.
   */
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    form.resetFields(); // Reset fields to defaults set in PromotionForm or initialValues below
    // form.setFieldsValue({ discountType: 'percentage', status: 'inactive' }); // Or explicitly set defaults here
    setIsModalVisible(true);
  };

  /**
   * @description Opens the modal for editing an existing promotion.
   * @param {Promotion} record The promotion record to edit.
   */
  const handleEditPromotion = (record: Promotion) => {
    setEditingPromotion(record);
    // Form values will be set by the initialFormValues derived from editingPromotion
    // We still need to reset/set fields *after* state update if modal wasn't destroyed
    // but destroyOnClose={true} on Modal makes this less critical.
    // For safety, explicitly setting fields here ensures UI updates correctly if Modal reuse logic changes.
    const valuesToSet = {
      ...record,
      status: record.status === "expired" ? "inactive" : record.status,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
    };
    form.setFieldsValue(valuesToSet);
    setIsModalVisible(true);
  };

  /**
   * @description Handles closing the modal.
   */
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  /**
   * @description Handles form submission (Add/Edit).
   * @param {PromotionFormValues & { dateRange: [dayjs.Dayjs, dayjs.Dayjs] }} values Form values including date range.
   */
  const handleFormSubmit = async (
    values: PromotionFormValues & { dateRange: [dayjs.Dayjs, dayjs.Dayjs] }
  ) => {
    setLoading(true);
    const [startDate, endDate] = values.dateRange;
    const newPromotionData = {
      ...values,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    delete (newPromotionData as any).dateRange;

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (editingPromotion) {
      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === editingPromotion.id
            ? { ...promo, ...newPromotionData }
            : promo
        )
      );
      message.success(`Promotion ${newPromotionData.code} updated (mock)`);
    } else {
      const newPromo: Promotion = {
        ...newPromotionData,
        id: `promo${Date.now()}`,
      };
      setPromotions((prev) => [...prev, newPromo]);
      message.success(`Promotion ${newPromo.code} added (mock)`);
    }

    setLoading(false);
    setIsModalVisible(false);
    setEditingPromotion(null);
    form.resetFields();
  };

  /**
   * @description Handles deleting a promotion after confirmation.
   * @param {Promotion} promotionToDelete The promotion object to delete.
   */
  const handleDeletePromotion = (promotionToDelete: Promotion) => {
    Modal.confirm({
      title: `Delete Promotion: ${promotionToDelete.code}?`,
      content:
        "Are you sure you want to delete this promotion? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        // Make onOk async if needed for real API calls
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          // Actual deletion logic
          setPromotions((prev) =>
            prev.filter((promo) => promo.id !== promotionToDelete.id)
          );
          message.success(`Promotion ${promotionToDelete.code} deleted (mock)`);
        } catch (error) {
          message.error("Failed to delete promotion.");
          console.error("Deletion failed:", error);
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        console.log("Delete cancelled");
      },
    });
  };

  // Table columns definition
  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: Promotion) => (
        <span>
          {record.discountValue}
          {record.discountType === "percentage" ? "%" : "$"}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Promotion["status"]) => {
        let color;
        switch (status) {
          case "active":
            color = "green";
            break;
          case "inactive":
            color = "orange";
            break;
          case "expired":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Promotion) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEditPromotion(record)}>
            Edit
          </Button>
          <Button
            type="link"
            danger
            // Pass the full record to handleDeletePromotion
            onClick={() => handleDeletePromotion(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Content style={{ padding: "20px" }}>
      <Title level={2}>Manage Promotions</Title>
      <Button
        type="primary"
        onClick={handleAddPromotion}
        style={{ marginBottom: 16 }}
      >
        Add Promotion
      </Button>
      <Table
        columns={columns}
        dataSource={promotions}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingPromotion ? "Edit Promotion" : "Add New Promotion"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editingPromotion ? "Save Changes" : "Add Promotion"}
          </Button>,
        ]}
        destroyOnClose
      >
        <PromotionForm
          key={editingPromotion ? editingPromotion.id : "add"}
          formInstance={form}
          onFinish={handleFormSubmit}
          initialValues={initialFormValues}
          isLoading={loading}
        />
      </Modal>
    </Content>
  );
};

export default AdminPromotionsPage;
