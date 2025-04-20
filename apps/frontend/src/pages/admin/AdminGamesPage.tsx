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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Game } from "@/types/game"; // Assuming Game type is defined
// TODO: Replace with actual API hook for admin game fetching
import { useGames } from "@/hooks/useGames";

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
  // TODO: Adapt this hook or create a new one for admin data fetching
  // It might need different parameters or return structure
  const { games, isLoading, isError } = useGames(); // Using existing hook for now

  // Placeholder handlers for CRUD actions
  const handleAddGame = () => {
    console.log("TODO: Implement Add Game");
    // Open Add/Edit Modal (Task 32)
  };

  const handleEditGame = (game: AdminGame) => {
    console.log("TODO: Implement Edit Game:", game);
    // Open Add/Edit Modal with initial values (Task 32)
  };

  const handleDeleteGame = (gameId: number) => {
    console.log("TODO: Implement Delete Game:", gameId);
    // Show confirmation, call API (Task 32)
  };

  // Define table columns
  const columns = [
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
      onFilter: (value: string, record: AdminGame) => record.category === value,
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
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditGame(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteGame(record.id)}
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddGame}
          >
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
      </Content>
    </Layout>
  );
};

export default AdminGamesPage;
