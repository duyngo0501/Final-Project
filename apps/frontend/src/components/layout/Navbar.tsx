import React, { useContext } from "react";
import {
  Layout,
  Menu,
  Input,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Button,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const { Header } = Layout;
const { Search } = Input;

// Basic hover style for menu items
const menuItemHoverStyle: React.CSSProperties = {
  backgroundColor: "#f0f0f0", // Light grey background on hover
  borderRadius: "4px",
};

/**
 * @description The site-wide navigation bar with improved styling.
 * Includes logo, search, navigation links, conditional auth buttons, and cart icon.
 * @returns {React.FC} The Navbar component.
 */
const Navbar: React.FC = () => {
  const cartContext = useContext(CartContext);
  const totalItems = cartContext?.totalItems ?? 0;
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const signOut = useAuth((state) => state.signOut);
  const signInWithProvider = useAuth((state) => state.signInWithProvider);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location for active link

  const onSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    if (signOut) {
      signOut().catch((err) => console.error("Sign out failed:", err));
    } else {
      console.error("SignOut function not available from AuthContext");
    }
  };

  // Add handler for login button click
  const handleLoginClick = () => {
    signInWithProvider({ provider: "google" }).catch((err) => {
      // Error is handled in context, but log here just in case
      console.error("Error initiating Google sign-in from Navbar:", err);
    });
  };

  // Define menu items array for Antd v5+
  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Home</Link>,
      style: location.pathname === "/" ? menuItemHoverStyle : {}, // Apply style if active
    },
    {
      key: "/games",
      label: <Link to="/games">Games</Link>,
      style: location.pathname.startsWith("/games") ? menuItemHoverStyle : {}, // Apply style if active
    },
    {
      key: "/blog",
      label: <Link to="/blog">Blog</Link>,
      style: location.pathname.startsWith("/blog") ? menuItemHoverStyle : {}, // Apply style if active
    },
  ];

  const userMenu = (
    <Menu
      items={[
        // Use items prop for Antd v5+
        {
          key: "profile",
          label: (
            <Link to="/profile">
              <UserOutlined style={{ marginRight: 8 }} /> Profile
            </Link>
          ),
        },
        {
          key: "logout",
          label: (
            <>
              <LogoutOutlined style={{ marginRight: 8 }} /> Logout
            </>
          ),
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        padding: "0 32px", // Increased padding
        gap: "24px",
        borderBottom: "1px solid #f0f0f0", // Subtle bottom border
        position: "sticky", // Make it sticky
        top: 0,
        zIndex: 10, // Ensure it stays on top
        width: "100%",
      }}
    >
      {/* Logo */}
      <div className="logo">
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              color: "#1890ff",
              margin: 0,
              fontSize: "24px",
              fontWeight: 600,
            }}
          >
            GameStore
          </h1>
        </Link>
      </div>

      {/* Center Group: Search + Menu */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          flexGrow: 1,
          justifyContent: "flex-start",
        }}
      >
        {" "}
        {/* Increased gap, align left */}
        <Menu
          theme="light"
          mode="horizontal"
          selectedKeys={[location.pathname]} // Control selected item
          items={menuItems}
          style={{
            lineHeight: "64px",
            borderBottom: "none", // Remove default border
            backgroundColor: "transparent", // Make background transparent
            flexGrow: 0, // Don't let menu grow excessively
            display: "flex",
            gap: "8px", // Add gap between menu items
          }}
          // Apply hover effect using item's style prop in menuItems array
        />
        <Search
          placeholder="Search games..."
          onSearch={onSearch}
          enterButton
          style={{ width: 300, verticalAlign: "middle" }} // Slightly wider search
        />
      </div>

      {/* Right Group: Cart + Auth */}
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        {" "}
        {/* Prevent shrinking */}
        <Space size="large">
          <Link
            to="/cart"
            style={{ display: "flex", alignItems: "center", color: "#555" }}
          >
            <Badge count={totalItems} showZero size="small">
              <ShoppingCartOutlined style={{ fontSize: "24px" }} />
            </Badge>
          </Link>
          {isAuthenticated ? (
            <Dropdown
              overlay={userMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
              />
            </Dropdown>
          ) : (
            <Space size="middle">
              <Button type="text" onClick={handleLoginClick}>
                Login
              </Button>
              <Button type="primary" onClick={handleLoginClick}>
                Register
              </Button>
            </Space>
          )}
        </Space>
      </div>
    </Header>
  );
};

export default Navbar;
