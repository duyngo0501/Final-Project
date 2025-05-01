import React from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Typography,
  Spin,
  Result,
  Button,
  Space,
  Breadcrumb,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useGetBlogPostApiV1BlogsBlogIdGet } from "@/gen/query/BlogsHooks/index";
import type { BlogResponseSchema } from "@/gen/types/index";

const { Title, Paragraph, Text } = Typography;

/**
 * @description Displays the full content of a single blog post.
 * Fetches post based on ID from URL query parameters.
 * Renders HTML content unsafely (requires sanitization in real app).
 * @returns {JSX.Element} The rendered blog post detail page.
 */
const BlogPostDetailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const postId = searchParams.get("id");

  const {
    data: queryResponse,
    error,
    isLoading,
  } = useGetBlogPostApiV1BlogsBlogIdGet(postId || "", {
    shouldFetch: !!postId,
  });

  if (!postId) {
    return (
      <Result
        status="warning"
        title="Missing Post ID"
        subTitle="Cannot display post without an ID."
        extra={
          <Button type="primary" onClick={() => navigate("/blog")}>
            Back to Blog
          </Button>
        }
        style={{ padding: "50px 0" }}
      />
    );
  }

  if (isLoading) {
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

  if (error) {
    const status = (error as any)?.response?.status;
    const detail = (error as any)?.response?.data?.detail;
    const msg =
      typeof error === "object" && error !== null && "message" in error
        ? String(error.message)
        : undefined;
    const errorMsg = detail || msg || "Unknown error loading post";
    message.error(`Error loading post: ${errorMsg}`);

    return (
      <Result
        status={status === 404 ? "404" : "error"}
        title={status === 404 ? "Post Not Found" : "Error Loading Post"}
        subTitle={
          status === 404
            ? "Sorry, the blog post you requested does not exist."
            : `Failed to load post: ${errorMsg}`
        }
        extra={
          <Button type="primary" onClick={() => navigate("/blog")}>
            Back to Blog
          </Button>
        }
        style={{ padding: "50px 0" }}
      />
    );
  }

  const post = queryResponse?.data;

  if (!post) {
    return (
      <Result
        status="warning"
        title="Post Data Missing"
        subTitle="Received a successful response but no post data was found."
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
          {post.date
            ? new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "No Date"}
        </span>
      </Space>

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
        style={{ lineHeight: "1.7", fontSize: "16px" }}
      />
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
