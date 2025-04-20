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
 * @description Admin page for viewing and managing games with CRUD operations.
 * @returns {React.FC} The AdminGamesPage component.
 */
const AdminGamesPage: React.FC = () => {
  const { games, isLoading, error: isError, mutate } = useGames();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Modal Handlers ---
  const showAddModal = () => {
    setEditingGame(null);
    setIsModalVisible(true);
  };

  const showEditModal = (game: Game) => {
    setEditingGame(game);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingGame(null);
  };

  /**
   * @description Handles the submission of the GameForm (Add or Edit).
   * @param {GameFormValues} values Processed form values from GameForm.
   */
  const handleFormSubmit = async (values: GameFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting Game (Processed Values):", values);

    try {
      // --- Mock API Call --- (Replace with actual API)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (editingGame) {
        // Mock Update
        const updatedGameData = { ...values, id: editingGame.id }; // Use editingGame.id
        console.log("[Mock API] Updating game:", updatedGameData);
        // TODO: Call actual update API: await gamesAdminAPI.updateGame(editingGame.id, updatedGameData);
        message.success(`Game '${values.title}' updated successfully!`);
      } else {
        // Mock Add
        const newGameData = { ...values, id: Date.now() }; // Generate temp ID
        console.log("[Mock API] Adding new game:", newGameData);
        // TODO: Call actual add API: await gamesAdminAPI.addGame(newGameData);
        message.success(`Game '${values.title}' added successfully!`);
      }
      // --- End Mock API Call ---

      mutate?.(); // Revalidate data
      setIsModalVisible(false);
      setEditingGame(null);
    } catch (error: any) {
      console.error("Failed to save game:", error);
      message.error(error.message || "Failed to save game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handler ---
  const handleDeleteGame = (game: Game) => {
    Modal.confirm({
      title: `Delete Game: ${game.title}?`,
      content: "Are you sure? This cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          // Note: Consider using a different loading state for delete if needed
          // setIsDeleting(true);
          console.log("[Mock API] Deleting game:", game.id);
          await new Promise((resolve) => setTimeout(resolve, 500));
          // TODO: Call actual delete API: await gamesAdminAPI.deleteGame(game.id);
          message.success(`Game '${game.title}' deleted successfully!`);
          mutate?.(); // Revalidate data
        } catch (error: any) {
          console.error("Failed to delete game:", error);
          message.error(error.message || "Failed to delete game.");
        } finally {
          // setIsDeleting(false);
        }
      },
    });
  };

  // Define table columns
  const columns: ColumnsType<Game> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    { title: "Category", dataIndex: "category", key: "category", width: 120 },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number, record: Game) => (
        <span>
          {record.discountedPrice !== undefined &&
          record.discountedPrice !== null ? (
            <span>
              <span
                style={{
                  textDecoration: "line-through",
                  marginRight: "5px",
                  color: "#888",
                }}
              >
                ${price.toFixed(2)}
              </span>
              <span style={{ color: "#f5222d" }}>
                ${record.discountedPrice.toFixed(2)}
              </span>
            </span>
          ) : (
            `$${price.toFixed(2)}`
          )}
        </span>
      ),
      sorter: (a: Game, b: Game) => a.price - b.price,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center" as const,
      render: (_: any, record: Game) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteGame(record)}
            // Consider adding loading state here if delete takes time
            // loading={isDeleting && deletingId === record.id}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ padding: 16 }}>
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

        {/* {isError && (
          <Alert 
            message="Error loading games" 
            description={ typeof isError === 'string' ? isError : "Failed to fetch game data."}
            type="error" 
            showIcon 
            style={{ marginBottom: 16 }} 
           />
        )} */}

        <Table
          columns={columns}
          dataSource={(games as Game[]) || []}
          rowKey="id"
          loading={isLoading}
          bordered
          size="middle"
        />

        {/* Add/Edit Modal */}
        <Modal
          title={editingGame ? "Edit Game" : "Add New Game"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null} // Remove default footer
          destroyOnClose
          width={720}
        >
          {/* Render GameForm only when modal is intended to be visible */}
          {isModalVisible && (
            <GameForm
              initialValues={editingGame}
              onFinish={handleFormSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminGamesPage;
