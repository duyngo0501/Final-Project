import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import ProLayout, { PageContainer } from "@ant-design/pro-layout";
import { ConfigProvider, theme } from "antd";
import {
  HomeOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Main application layout using Ant Design ProLayout.
 * Integrates custom Header and Footer, provides basic navigation,
 * and renders page content via Outlet.
 * @returns {JSX.Element} The rendered main layout.
 */
const MainLayout = (): JSX.Element => {
  const location = useLocation();
  const isAuthenticated = useAuth((state) => state.isAuthenticated);
  const { token } = theme.useToken(); // Access theme tokens

  // Basic menu items - can be expanded or made dynamic later
  const menuItems = [
    { path: "/", name: "Home", icon: <HomeOutlined /> },
    { path: "/games", name: "Games", icon: <ShopOutlined /> },
    { path: "/cart", name: "Cart", icon: <ShoppingCartOutlined /> },
    ...(isAuthenticated
      ? [{ path: "/profile", name: "Profile", icon: <UserOutlined /> }]
      : [{ path: "/login", name: "Login", icon: <LoginOutlined /> }]),
  ];

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <ConfigProvider
        theme={{
          components: {
            Layout: {
              headerBg: token.colorFillSecondary, // Use a theme token for gray header background
              // ProLayout might not directly use this, styling headerRender might be needed
            },
          },
        }}
      >
        <ProLayout
          style={{ minHeight: "100vh" }}
          layout="mix" // Top navigation + sidebar (can be hidden)
          title="GameStore"
          logo={null} // Or add a logo URL/component
          fixedHeader
          fixSiderbar // Sidebar fixed, can be hidden if only top nav is needed
          navTheme="light" // Or "realDark" based on preference
          contentWidth="Fluid"
          colorPrimary={token.colorPrimary} // Use primary color from theme
          location={{
            pathname: location.pathname, // Sync ProLayout with router location
          }}
          menuDataRender={() => menuItems} // Render basic menu items
          menuItemRender={(item, dom) => (
            // Use React Router Link for navigation
            <Link to={item.path || "/"}>{dom}</Link>
          )}
          footerRender={() => <Footer />} // Render custom Footer
          // Disable elements if not needed (e.g., if only using top nav)
          // menuRender={false} // Hides the side menu if layout="mix" acts mainly as top nav
          // Hides the header settings button if not customized
          actionsRender={false}
          avatarProps={false}
        >
          {/* PageContainer provides standard padding and structure */}
          {/* Removing default padding to let pages control their own */}
          <PageContainer>
            <Outlet /> {/* Renders the matched child route */}
          </PageContainer>
        </ProLayout>
      </ConfigProvider>
    </div>
  );
};

export default MainLayout;
