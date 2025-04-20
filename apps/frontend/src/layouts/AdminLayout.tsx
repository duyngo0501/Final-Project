import React, { useState } from "react";
import { Layout, Menu, Breadcrumb, Typography, Avatar, Popover } from "antd";
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  DatabaseOutlined, // For Games
  ShoppingCartOutlined, // For Orders
  TagOutlined, // For Promotions
  LogoutOutlined, // For Logout
} from "@ant-design/icons";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // To get user info and logout

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

/**
 * @description Main layout component for the admin dashboard area.
 * Includes a collapsible sidebar menu and renders child routes.
 * @returns {React.FC} The AdminLayout component.
 */
const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth((state) => ({
    user: state.user,
    logout: state.logout,
  }));

  // Determine selected keys based on current path
  const selectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith("/admin/games")) return ["games"];
    if (path.startsWith("/admin/users")) return ["users"];
    if (path.startsWith("/admin/orders")) return ["orders"];
    if (path.startsWith("/admin/promotions")) return ["promotions"];
    // Add more conditions or a default key
    return ["dashboard"]; // Default if needed
  };

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login after logout
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: "32px",
            margin: "16px",
            background: "rgba(255, 255, 255, 0.2)",
            textAlign: "center",
            lineHeight: "32px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "A" : "ADMIN"}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["games"]}
          selectedKeys={selectedKeys()}
          mode="inline"
        >
          {/* Optional: Add a Dashboard link */}
          {/* <Menu.Item key="dashboard" icon={<PieChartOutlined />}> */}
          {/*   <Link to="/admin">Dashboard</Link> */}
          {/* </Menu.Item> */}
          <Menu.Item key="games" icon={<DatabaseOutlined />}>
            <Link to="/admin/games">Games</Link>
          </Menu.Item>
          <Menu.Item key="users" icon={<TeamOutlined />}>
            <Link to="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
            <Link to="/admin/orders">Orders</Link>
          </Menu.Item>
          <Menu.Item key="promotions" icon={<TagOutlined />}>
            <Link to="/admin/promotions">Promotions</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: "0 16px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Placeholder for Header content - maybe breadcrumbs or page title */}
          <div />
          {/* User Avatar and Logout */}
          <Popover placement="bottomRight" content={userMenu} trigger="click">
            <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
            <span style={{ marginLeft: 8, cursor: "pointer" }}>
              {user?.username || "Admin"}
            </span>
          </Popover>
        </Header>
        <Content style={{ margin: "16px" }}>
          {/* Breadcrumb can be added here based on location.pathname */}
          {/* <Breadcrumb style={{ margin: '16px 0' }}> */}
          {/*   <Breadcrumb.Item>Admin</Breadcrumb.Item> */}
          {/*   <Breadcrumb.Item>Games</Breadcrumb.Item> */}
          {/* </Breadcrumb> */}
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360, background: "#fff" }}
          >
            {/* Child routes will render here */}
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Admin Dashboard ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
