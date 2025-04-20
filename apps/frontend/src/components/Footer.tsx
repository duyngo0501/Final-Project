import { Link as RouterLink } from "react-router-dom";
import { Layout, Typography, Space, Divider, theme } from "antd";

const { Title, Paragraph, Text, Link: AntLink } = Typography;

/**
 * Footer component displaying site links and contact information using Ant Design.
 * @returns {JSX.Element} The rendered footer component.
 */
const Footer = (): JSX.Element => {
  const { Footer: AntFooter } = Layout;
  const { token } = theme.useToken();

  // Define text color based on token, suitable for elevated background
  const textColor = token.colorTextSecondary; // Use secondary text color for better contrast maybe
  const headingColor = token.colorText; // Use default text color for headings

  return (
    <AntFooter
      style={{ backgroundColor: token.colorBgElevated }}
      className="py-8"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <Title
              level={4}
              style={{ color: headingColor }}
              className="!text-xl !font-bold !mb-4"
            >
              About GameStore
            </Title>
            <Paragraph style={{ color: textColor }} className="!mb-0">
              Your one-stop destination for the best digital games. We offer a
              wide selection of games across different genres and platforms.
            </Paragraph>
          </div>

          {/* Quick Links */}
          <div>
            <Title
              level={4}
              style={{ color: headingColor }}
              className="!text-xl !font-bold !mb-4"
            >
              Quick Links
            </Title>
            <Space direction="vertical" size="small">
              <RouterLink
                to="/games"
                style={{ color: textColor }}
                className="hover:!text-white transition"
              >
                Browse Games
              </RouterLink>
              <RouterLink
                to="/cart"
                style={{ color: textColor }}
                className="hover:!text-white transition"
              >
                Shopping Cart
              </RouterLink>
              <RouterLink
                to="/profile"
                style={{ color: textColor }}
                className="hover:!text-white transition"
              >
                My Account
              </RouterLink>
            </Space>
          </div>

          {/* Contact Info */}
          <div>
            <Title
              level={4}
              style={{ color: headingColor }}
              className="!text-xl !font-bold !mb-4"
            >
              Contact Us
            </Title>
            <Space direction="vertical" size="small">
              <Text style={{ color: textColor }}>
                Email: support@gamestore.com
              </Text>
              <Text style={{ color: textColor }}>Phone: (555) 123-4567</Text>
              <Text style={{ color: textColor }}>
                Address: 123 Game Street, Digital City
              </Text>
            </Space>
          </div>
        </div>

        {/* Copyright */}
        <Divider
          style={{ borderColor: token.colorSplit }}
          className="!mt-8 !mb-8"
        />
        <div className="text-center">
          <Text style={{ color: textColor }}>
            &copy; {new Date().getFullYear()} GameStore. All rights reserved.
          </Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
