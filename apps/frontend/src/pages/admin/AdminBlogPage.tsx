import React, { useState } from "react";
import {
  Layout,
  Typography,
  Table,
  Button,
  Space,
  Tag,
  message,
  Modal,
  Row,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import BlogForm, { BlogFormValues } from "@/components/admin/BlogForm"; // Import the form

// Import generated hooks with correct names
import {
  useListBlogPostsApiV1BlogsGet,
  useCreateBlogPostApiV1BlogsPost,
} from "@/gen/query/BlogsHooks/index";

// Import generated types with correct names
import type {
  BlogResponseSchema,
  ListBlogPostsApiV1BlogsGetQueryResponse, // Type for list response
  // Request types for mutations
  CreateBlogPostApiV1BlogsPostMutationRequest,
  UpdateBlogPostApiV1BlogsBlogIdPutMutationRequest,
  DeleteBlogPostApiV1BlogsBlogIdDeletePathParams, // Use PathParams for delete
  // Import error type if needed
  // HTTPValidationError,
} from "@/gen/types/index";

// Import direct client functions for Update and Delete
import {
  updateBlogPostApiV1BlogsBlogIdPut,
  deleteBlogPostApiV1BlogsBlogIdDelete,
} from "@/gen/client/index"; // Assuming exported from index

const { Content } = Layout;
const { Title } = Typography;

/**
 * @description Maps API BlogResponseSchema to BlogFormValues.
 * @param {BlogResponseSchema} post The blog post data from the API.
 * @returns {Partial<BlogFormValues>} The values formatted for the form.
 */
const mapBlogPostToFormValues = (
  post: BlogResponseSchema
): Partial<BlogFormValues> => {
  return {
    title: post.title,
    author: post.author,
    dateRange: post.date ? [dayjs(post.date), null] : undefined,
    excerpt: post.excerpt ?? undefined,
    content: post.content,
  };
};

/**
 * @description Admin page for managing blog posts.
 * @returns {React.FC} The AdminBlogPage component.
 */
const AdminBlogPage: React.FC = () => {
  // Fetch data
  const {
    data: listQueryResponse,
    error: listError,
    isLoading: isLoadingList,
    mutate: mutateList,
  } = useListBlogPostsApiV1BlogsGet();

  // State for modal visibility and the post being edited
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<BlogResponseSchema | null>(
    null
  );

  // --- Initialize Hooks --- //

  // Create hook (always needed for the 'Add' button)
  const { trigger: createPost, isMutating: isCreating } =
    useCreateBlogPostApiV1BlogsPost();

  // Manual loading states for Update and Delete actions
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [isDeletingState, setIsDeletingState] = useState(false);

  // --- Modal Handlers ---
  const showAddModal = () => {
    setEditingPost(null); // Clear editing post
    setIsModalVisible(true);
  };

  const showEditModal = (post: BlogResponseSchema) => {
    setEditingPost(post); // Set the post to edit
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPost(null);
  };

  // --- CRUD Handlers using generated hooks ---
  const handleFormSubmit = async (values: BlogFormValues) => {
    const requestData = {
      title: values.title,
      author: values.author,
      date: values.dateRange?.[0] ? values.dateRange[0].toISOString() : null,
      excerpt: values.excerpt,
      content: values.content,
    };

    try {
      if (editingPost) {
        // --- Use direct client function for UPDATE ---
        setIsUpdatingState(true);
        await updateBlogPostApiV1BlogsBlogIdPut(editingPost.id, requestData);
        message.success(`Post "${values.title}" updated successfully`);
      } else {
        // --- Use SWR hook for CREATE ---
        // Pass requestData directly to the trigger
        await createPost(requestData);
        message.success(`Post "${values.title}" added successfully`);
      }
      await mutateList(); // Revalidate the list data
      setIsModalVisible(false);
      setEditingPost(null);
    } catch (error: any) {
      // Safest error handling
      const detail = (error as any)?.response?.data?.detail;
      const msg =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : undefined;
      const errorMsg = detail || msg || "Unknown error";
      message.error(`Failed to save post: ${errorMsg}`);
      console.error("Save post error:", error);
    } finally {
      if (editingPost) setIsUpdatingState(false);
    }
  };

  const handleDeletePost = (postToDelete: BlogResponseSchema) => {
    Modal.confirm({
      title: `Delete Post: ${postToDelete.title}?`,
      content: "Are you sure? This cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setIsDeletingState(true);
        try {
          await deleteBlogPostApiV1BlogsBlogIdDelete(postToDelete.id);
          message.success(`Post "${postToDelete.title}" deleted successfully`);
          await mutateList();
        } catch (error: any) {
          // Safest error handling
          const detail = (error as any)?.response?.data?.detail;
          const msg =
            typeof error === "object" && error !== null && "message" in error
              ? String(error.message)
              : undefined;
          const errorMsg = detail || msg || "Unknown error";
          message.error(`Failed to delete post: ${errorMsg}`);
          console.error("Delete post error:", error);
        } finally {
          setIsDeletingState(false);
        }
      },
    });
  };

  // Display error message if fetching list fails
  if (listError) {
    // Safest error handling
    const detail = (listError as any)?.response?.data?.detail;
    const msg =
      typeof listError === "object" &&
      listError !== null &&
      "message" in listError
        ? String(listError.message)
        : undefined;
    const errorMsg = detail || msg || "Unknown error";
    message.error(`Failed to load blog posts: ${errorMsg}`);
  }

  // --- Table Columns ---
  const columns: ColumnsType<BlogResponseSchema> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title ?? "").localeCompare(b.title ?? ""),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      sorter: (a, b) => (a.author ?? "").localeCompare(b.author ?? ""),
      width: 150,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string | null | undefined) =>
        date ? dayjs(date).format("YYYY-MM-DD") : "N/A",
      sorter: (a, b) => dayjs(a.date ?? 0).unix() - dayjs(b.date ?? 0).unix(),
      width: 120,
    },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 150,
      render: (_, record: BlogResponseSchema) => (
        <Space size="small">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={isDeletingState}
            onClick={() => handleDeletePost(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // --- Component Return ---
  return (
    <Layout style={{ padding: 16 }}>
      <Content>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Title level={3} style={{ margin: 0 }}>
            Manage Blog Posts
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Add New Post
          </Button>
        </Row>

        <Table
          columns={columns}
          dataSource={listQueryResponse?.data?.items ?? []}
          rowKey="id"
          loading={isLoadingList}
          bordered
          size="middle"
        />

        <Modal
          title={editingPost ? "Edit Blog Post" : "Add New Blog Post"}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          destroyOnClose
          width={800}
        >
          {isModalVisible && (
            <BlogForm
              key={editingPost ? editingPost.id : "new"}
              initialValues={
                editingPost ? mapBlogPostToFormValues(editingPost) : undefined
              }
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              // Pass combined loading state for form submit button
              isLoading={isCreating || isUpdatingState}
            />
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminBlogPage;
