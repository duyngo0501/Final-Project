import React, { useContext } from "react";
import { Layout, Menu, Input, Badge, Avatar, Dropdown, Space } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { CartContext, useCart } from "@/contexts/CartContext"; // Import context AND useCart hook
import { useAuth } from "@/contexts/AuthContext"; // Import Auth context hook

const { Header } = Layout;
const { Search } = Input;

/**
 * @description The site-wide navigation bar.
 * Includes logo, search, navigation links, conditional auth buttons, and cart icon.
 * Uses useCartTotalItems hook for cart count and useAuth for auth status.
 * @returns {React.FC} The Navbar component.
 */
const Navbar: React.FC = () => {
  // Use standard useContext to get the full context value first
  const cartContext = useContext(CartContext);
  // Now safely access totalItems, providing a default if context is undefined
  const totalItems = cartContext?.totalItems ?? 0;

  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const onSearch = (value: string) => {
    console.log("Search query:", value);
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      navigate("/");
    } else {
      console.error("Logout function not available from AuthContext");
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">
          <UserOutlined style={{ marginRight: 8 }} /> Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined style={{ marginRight: 8 }} /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div className="logo" style={{ marginRight: "auto" }}>
        <Link to="/">
          <h1 style={{ color: "#1890ff", margin: 0, fontSize: "24px" }}>
            GameStore
          </h1>
        </Link>
      </div>
      <Search
        placeholder="Search games..."
        onSearch={onSearch}
        enterButton
        style={{ width: 250, marginRight: "20px", verticalAlign: "middle" }}
      />
      <Menu
        theme="light"
        mode="horizontal"
        style={{ lineHeight: "64px", borderBottom: "none", flexGrow: 1 }}
      >
        <Menu.Item key="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="categories">
          <Link to="/games">Game Categories</Link>
        </Menu.Item>
        <Menu.Item key="blog">
          <Link to="/blog">Blog</Link>
        </Menu.Item>
      </Menu>
      <div
        style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
      >
        <Space size="large">
          <Link to="/cart" style={{ display: "flex", alignItems: "center" }}>
            <Badge count={totalItems} showZero>
              <ShoppingCartOutlined
                style={{ fontSize: "24px", color: "#555" }}
              />
            </Badge>
          </Link>
          {isAuthenticated ? (
            <Dropdown overlay={userMenu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
            </Dropdown>
          ) : (
            <Space>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </Space>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default Navbar;
