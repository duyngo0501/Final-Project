import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Typography, Spin, Result, Button, Space, Breadcrumb } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { mockBlogPosts } from "@/mocks/blogMocks";
import { BlogPost } from "@/types/blog";

const { Title, Paragraph, Text } = Typography;

/**
 * @description Displays the full content of a single blog post.
 * Fetches post based on ID from URL params and uses mock data.
 * Renders HTML content unsafely (requires sanitization in real app).
 * @returns {JSX.Element} The rendered blog post detail page.
 */
const BlogPostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined); // undefined means loading, null means not found
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    const timer = setTimeout(() => {
      const foundPost = mockBlogPosts.find((p) => p.id === postId);
      setPost(foundPost || null); // Set to null if not found
      setLoading(false);
    }, 300); // Simulate network delay

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [postId]);

  if (loading || post === undefined) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!post) {
    return (
      <Result
        status="404"
        title="Post Not Found"
        subTitle="Sorry, the blog post you visited does not exist."
        extra={
          <Button type="primary" onClick={() => navigate("/blog")}>
            Back to Blog
          </Button>
        }
        style={{ padding: "50px 0" }}
      />
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "0 15px" }}>
      <Breadcrumb style={{ marginBottom: "20px" }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/blog">Blog</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} style={{ marginBottom: "15px" }}>
        {post.title}
      </Title>
      <Space size="middle" style={{ marginBottom: "25px", color: "#888" }}>
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {post.author}
        </span>
        <span>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </Space>

      {/* Render HTML content - WARNING: Use with caution, sanitize in real apps */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
        style={{ lineHeight: "1.7", fontSize: "16px" }} // Basic styling for content
      />
      {/* Add some basic styling for elements potentially in content */}
      <style>{`
            .blog-content h1, .blog-content h2, .blog-content h3 {
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            .blog-content p {
                margin-bottom: 1em;
            }
            .blog-content ul, .blog-content ol {
                margin-left: 2em;
                margin-bottom: 1em;
            }
            .blog-content img {
                max-width: 100%;
                height: auto;
                margin: 1em 0;
            }
        `}</style>

      <Button
        type="link"
        onClick={() => navigate("/blog")}
        style={{ marginTop: "30px" }}
      >
        &larr; Back to Blog List
      </Button>
    </div>
  );
};

export default BlogPostDetailPage;
