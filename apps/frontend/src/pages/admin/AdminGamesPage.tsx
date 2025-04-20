import React, { useState, useEffect } from "react";
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
  Form,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Game } from "@/types/game"; // Assuming Game type is defined
// TODO: Replace with actual API hook for admin game fetching
import { useGames } from "@/hooks/useGames";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import GameForm, { GameFormValues } from "@/components/admin/GameForm"; // Import the form

const { Content } = Layout;
const { Title } = Typography;

// Placeholder data structure if useGames returns different format
interface AdminGame extends Game {
  // Add any admin-specific fields if necessary
}

/**
 * @description Admin page for viewing and managing games.
 * @returns {React.FC} The AdminGamesPage component.
 */
const AdminGamesPage: React.FC = () => {
  const { games, isLoading, isError, mutate } = useGames(); // Get mutate from useGames if available for optimistic updates
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Partial<AdminGame> | null>(
    null
  ); // Use Partial for Add case
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use Ant Design form instance
  const [form] = Form.useForm();

  // --- Modal and Form Handlers ---
  const showAddModal = () => {
    setEditingGame(null); // Ensure it's an add operation
    form.resetFields(); // Reset form fields for add
    setIsModalVisible(true);
  };

  const showEditModal = (game: AdminGame) => {
    setEditingGame(game); // Set the game being edited
    form.setFieldsValue(game); // Populate form with game data
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingGame(null);
    form.resetFields(); // Reset form on cancel
  };

  /**
   * @description Handles the submission of the GameForm (Add or Edit).
   * @param {GameFormValues} values Form values from GameForm.
   */
  const handleFormSubmit = async (values: GameFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting Game:", values);
    const gameData = { ...values, id: editingGame?.id || Date.now() }; // Assign existing ID or generate one for mock

    try {
      // --- Mock API Call --- (Replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (editingGame?.id) {
        // Mock Update
        console.log("[Mock API] Updating game:", gameData);
        // TODO: Call actual update API: await gamesAdminAPI.updateGame(editingGame.id, gameData);
        message.success(`Game '${gameData.title}' updated successfully!`);
      } else {
        // Mock Add
        console.log("[Mock API] Adding new game:", gameData);
        // TODO: Call actual add API: await gamesAdminAPI.addGame(gameData);
        message.success(`Game '${gameData.title}' added successfully!`);
      }
      // --- End Mock API Call ---

      // TODO: Trigger SWR revalidation if using mock or direct API
      if (mutate) {
        // Mutate the useGames data to reflect changes without full reload
        // This requires the mock API to update the underlying source OR
        // implementing optimistic updates within useGames or here.
        // Simple revalidation for now:
        mutate();
      }

      setIsModalVisible(false);
      setEditingGame(null);
      form.resetFields();
    } catch (error: any) {
      console.error("Failed to save game:", error);
      message.error(error.message || "Failed to save game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler ---
  const handleDeleteGame = (game: AdminGame) => {
    Modal.confirm({
      title: `Delete Game: ${game.title}?`,
      content:
        "Are you sure you want to delete this game? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          setIsSubmitting(true); // Use same flag for visual feedback
          // --- Mock API Call ---
          console.log("[Mock API] Deleting game:", game.id);
          await new Promise((resolve) => setTimeout(resolve, 500));
          // TODO: Call actual delete API: await gamesAdminAPI.deleteGame(game.id);
          message.success(`Game '${game.title}' deleted successfully!`);
          // --- End Mock API Call ---
          if (mutate) mutate(); // Revalidate data
        } catch (error: any) {
          console.error("Failed to delete game:", error);
          message.error(error.message || "Failed to delete game.");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  // Define table columns
  const columns: ColumnsType<AdminGame> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a: AdminGame, b: AdminGame) => a.id - b.id,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: AdminGame, b: AdminGame) => a.title.localeCompare(b.title),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      filters: [
        { text: "PC", value: "pc" },
        { text: "Console", value: "console" },
        { text: "Mobile", value: "mobile" },
      ],
      onFilter: (value: any, record: AdminGame) => record.category === value,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      sorter: (a: AdminGame, b: AdminGame) => a.price - b.price,
      render: (price: number) => `$${price.toFixed(2)}`, // Basic formatting
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center" as const,
      render: (_: any, record: AdminGame) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteGame(record)}
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
            Manage Games
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add New Game
          </Button>
        </Row>

        {isError && (
          <Alert
            message="Error loading games"
            description={isError.message || "Failed to fetch game data."}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={(games as AdminGame[]) || []} // Use fetched games for now
          rowKey="id"
          loading={isLoading}
          bordered
        />

        {/* Add/Edit Modal */}
        <Modal
          title={editingGame?.id ? "Edit Game" : "Add New Game"}
          visible={isModalVisible}
          onCancel={handleCancel}
          confirmLoading={isSubmitting} // Show loading on OK button
          // We use the form's submit handler, triggered by the OK button
          onOk={() => form.submit()} // Trigger form submission
          destroyOnClose // Destroy form state when modal is closed
          // okText={editingGame?.id ? "Save Changes" : "Add Game"} // Customize button text
          // cancelText="Cancel"
        >
          <GameForm
            formInstance={form} // Pass form instance
            initialValues={editingGame || undefined}
            onFinish={handleFormSubmit}
            isLoading={isSubmitting}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminGamesPage;
