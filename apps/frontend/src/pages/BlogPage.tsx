import React from "react";
import { List, Card, Typography, Space, Spin, message } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useListBlogPostsApiV1BlogsGet } from "@/gen/query/BlogsHooks/index";
import type { BlogResponseSchema } from "@/gen/types/index";

const { Title, Paragraph } = Typography;

/**
 * @description BlogPage component displaying a list of blog posts.
 * @returns {JSX.Element} The rendered blog page.
 */
const BlogPage: React.FC = () => {
  const {
    data: queryResponse,
    error,
    isLoading,
  } = useListBlogPostsApiV1BlogsGet();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    const detail = (error as any)?.response?.data?.detail;
    const msg =
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : undefined;
    const errorMsg = detail || msg || "Unknown error loading posts";
    message.error(`Error loading posts: ${errorMsg}`);
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4}>Could not load blog posts.</Title>
        <Paragraph>Please try again later.</Paragraph>
      </div>
    );
  }

  const blogPosts = queryResponse?.data?.items ?? [];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 15px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        GameStore Blog
      </Title>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={blogPosts}
        renderItem={(post: BlogResponseSchema) => (
          <List.Item key={post.id} style={{ padding: 0, marginBottom: "24px" }}>
            <Card hoverable>
              <Title level={3}>
                <Link to={`/blog-detail?id=${post.id}`}>{post.title}</Link>
              </Title>
              <Space
                size="middle"
                style={{ marginBottom: "10px", color: "#888" }}
              >
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {post.author}
                </span>
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {post.date
                    ? new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "No date"}
                </span>
              </Space>
              <Paragraph>
                {post.excerpt ?? post.content?.substring(0, 150) + "..."}
              </Paragraph>
              <Link to={`/blog-detail?id=${post.id}`}>Read More...</Link>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default BlogPage;
