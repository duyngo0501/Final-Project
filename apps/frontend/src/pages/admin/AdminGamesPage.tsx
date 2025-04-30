import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Game, GameListingResponse } from "@/gen/types"; // Generated API types
import { type GameControllerListGamesQueryParams } from "@/gen/types/GameControllerListGames";
import { useGameControllerListGames } from "@/gen/query/GamesHooks"; // Import the SWR hook
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import GameForm, { GameFormValues } from "@/components/admin/GameForm"; // Import the form

const { Content } = Layout;
const { Title } = Typography;

// --- Mapping function (same as in SearchResultsPage, potentially move to a util file later) ---

/**
 * @description Admin page for viewing and managing games with CRUD operations.
 * @returns {React.FC} The AdminGamesPage component.
 */
const AdminGamesPage: React.FC = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 }); // Add pagination state
  const [sorter, setSorter] = useState<{
    field?: string;
    order?: "ascend" | "descend";
  }>({}); // Add sorter state

  // Derive API parameters from local state
  const apiQueryParams = useMemo(() => {
    const skip = (pagination.current - 1) * pagination.pageSize;
    const limit = pagination.pageSize;
    // Map antd sorter field to potential API field names if necessary
    // Example: const apiSortField = sorter.field === 'title' ? 'name' : sorter.field;
    const apiSortField = sorter.field;
    // Convert antd sorter order to API's boolean `is_asc` parameter
    const isAscending =
      sorter.order === "ascend"
        ? true
        : sorter.order === "descend"
          ? false
          : undefined;

    // Construct the params object, filtering out undefined values
    const params: GameControllerListGamesQueryParams = {};
    if (skip !== undefined) params.skip = skip;
    if (limit !== undefined) params.limit = limit;
    if (apiSortField !== undefined) params.sort_by = apiSortField;
    // Use the correct boolean parameter name for sorting direction
    if (isAscending !== undefined) params.is_asc = isAscending;

    // Add any other static filters if needed here

    return params;
  }, [pagination, sorter]);

  // --- Fetch Games using SWR Hook --- //
  const {
    data: response, // Raw SWR response
    error: fetchError,
    isLoading,
    mutate, // SWR mutate function
  } = useGameControllerListGames(
    // Pass API query parameters as the first argument
    apiQueryParams,
    // Pass SWR/React Query options as the second argument, nested under 'query'
    {
      query: {
        // SWR options
        keepPreviousData: true, // Keep showing old data while loading new page
        revalidateOnFocus: false, // Optional: prevent refetch on window focus
      },
      // Add client config if needed
    }
  );

  // --- Process API Response & Map Data --- //
  const { games, total } = useMemo(() => {
    const items: Game[] = response?.data?.items ?? [];
    const totalCount: number = response?.data?.total ?? 0;
    return { games: items, total: totalCount };
  }, [response]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null); // Use Game type
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Modal Handlers ---
  const showAddModal = () => {
    setEditingGame(null);
    setIsModalVisible(true);
  };

  const showEditModal = (game: Game) => {
    // Use Game type
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
    // Use UIGame type
    Modal.confirm({
      title: `Delete Game: ${game.name}?`,
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
          message.success(`Game '${game.name}' deleted successfully!`);
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

  // --- Table Change Handler --- //
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
    setSorter({ field: sorter.field, order: sorter.order });
    // SWR will automatically refetch when params change
  };

  // Define table columns
  const columns: ColumnsType<Game> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: true, // Enable server-side sorting
      width: 150, // Adjust width if needed for UUIDs
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: true, // Enable server-side sorting
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      sorter: true,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number, record: Game) => (
        <span>
          {/* Check for unavailable price based on mapping */}
          {price < 0 ? (
            <span style={{ fontStyle: "italic", color: "#888" }}>
              Unavailable
            </span>
          ) : (
            <span>`$${price.toFixed(2)}`</span>
          )}
        </span>
      ),
      sorter: true, // Enable server-side sorting
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

        {fetchError && (
          <Alert
            message="Error loading games"
            description={
              fetchError instanceof Error
                ? fetchError.message
                : "Failed to fetch game data."
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          columns={columns}
          dataSource={games} // Use the mapped games array
          rowKey="id"
          loading={isLoading}
          pagination={{
            ...pagination,
            total: total, // Use total count from API response
            showSizeChanger: true,
          }}
          onChange={handleTableChange} // Handle pagination/sorting changes
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
