import { Outlet, useLocation } from "react-router-dom";
import { ConfigProvider, Layout, theme } from "antd";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/Footer";

const { Content, Header: AntHeader, Footer: AntFooter } = Layout;

/**
 * Main application layout using standard Ant Design Layout.
 * Provides Header (Navbar), Content (Outlet), and Footer.
 * @returns {JSX.Element} The rendered main layout.
 */
const MainLayout = (): JSX.Element => {
  const { token } = theme.useToken(); // Access theme tokens for styling

  return (
    <ConfigProvider
      // Keep theme customization if needed, adjust component names
      theme={{
        components: {
          Layout: {
            headerBg: token.colorBgContainer, // Standard header background
            headerPadding: "0 24px", // Adjust padding as needed
            bodyBg: token.colorBgLayout, // Background for the main content area
          },
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <AntHeader
          style={{
            padding: 0, // Remove default padding if Navbar handles it
            backgroundColor: token.colorBgContainer,
            // Add other header styles like position: sticky if desired
            // position: 'sticky',
            // top: 0,
            // zIndex: 10,
            // width: '100%',
          }}
        >
          {/* Render the specific Navbar component */}
          <Navbar />
        </AntHeader>
        <Content
          style={{
            // Add padding here if needed, or let pages handle it
            // padding: '24px',
            backgroundColor: token.colorBgLayout,
            flex: "1 0 auto", // Ensure content grows
          }}
        >
          <Outlet /> {/* Renders the matched child route */}
        </Content>
        <AntFooter style={{ padding: 0, backgroundColor: "transparent" }}>
          {/* Footer might handle its own background, remove padding */}
          <Footer />
        </AntFooter>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
