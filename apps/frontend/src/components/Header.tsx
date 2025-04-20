import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Button, Typography, Badge, Dropdown, Menu, theme } from "antd";
import type { MenuProps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const { Title } = Typography;

/**
 * Header component displaying navigation, cart status, and user authentication links using Ant Design components.
 * @returns {JSX.Element} The rendered header component.
 */
const Header = (): JSX.Element => {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const user = useAuth((state) => state.user);
  const { logout } = useAuth((state) => ({ logout: state.logout }));
  const totalItems = useCart((state) => state.totalItems);

  const { Header: AntHeader } = Layout;

  const handleLogout = () => {
    logout();
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link to="/profile">My Profile</Link>,
    },
    {
      key: "logout",
      label: "Logout",
      onClick: handleLogout,
      danger: true,
    },
  ];

  const linkStyle: React.CSSProperties = {
    color: token.colorText,
  };
  const linkHoverStyle: React.CSSProperties = {
    color: token.colorPrimaryHover,
  };

  return (
    <AntHeader
      className="shadow-md sticky top-0 z-50 w-full"
      style={{
        paddingInline: 0,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-full">
          <Title level={3} className="!mb-0">
            <Link to="/" style={linkStyle}>
              GameStore
            </Link>
          </Title>

          <nav className="flex items-center space-x-1">
            <Button type="link" style={linkStyle} onClick={() => navigate("/")}>
              Home
            </Button>
            <Button
              type="link"
              style={linkStyle}
              onClick={() => navigate("/games")}
            >
              Games
            </Button>
            <Button
              type="link"
              style={linkStyle}
              className="flex items-center"
              onClick={() => navigate("/cart")}
            >
              <Badge
                count={totalItems}
                size="small"
                offset={[5, -2]}
                className="mr-1"
              >
                <ShoppingCartOutlined
                  style={{
                    fontSize: "18px",
                    marginRight: "4px",
                    color: token.colorText,
                  }}
                />
              </Badge>
              Cart
            </Button>
            {isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="link"
                  style={linkStyle}
                  className="flex items-center"
                >
                  <UserOutlined
                    className="mr-1"
                    style={{ color: token.colorText }}
                  />
                  {user?.username || "Profile"}
                </Button>
              </Dropdown>
            ) : (
              <Button
                type="link"
                style={linkStyle}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
