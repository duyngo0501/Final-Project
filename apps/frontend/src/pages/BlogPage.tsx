import React from "react";
import { List, Card, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { mockBlogPosts } from "@/mocks/blogMocks";

const { Title, Paragraph } = Typography;

/**
 * @description BlogPage component displaying a list of blog posts.
 * @returns {JSX.Element} The rendered blog page.
 */
const BlogPage: React.FC = () => {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 15px" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
        GameStore Blog
      </Title>
      <List
        itemLayout="vertical"
        size="large"
        dataSource={mockBlogPosts}
        renderItem={(post) => (
          <List.Item
            key={post.id}
            style={{ padding: 0, marginBottom: "24px" }} // Remove default padding, add margin
          >
            <Card hoverable>
              <Title level={3}>
                <Link to={`/blog/${post.id}`}>{post.title}</Link>
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
                  {new Date(post.date + "T00:00:00").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </Space>
              <Paragraph>{post.excerpt}</Paragraph>
              <Link to={`/blog/${post.id}`}>Read More...</Link>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default BlogPage;
