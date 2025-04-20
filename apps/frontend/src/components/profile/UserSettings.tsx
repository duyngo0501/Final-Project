import React from "react";
import {
  Card,
  Form,
  Switch,
  Checkbox,
  Divider,
  Typography,
  Select,
  Button,
  Space,
  Alert,
} from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * UserSettings Component
 * Displays placeholder UI elements for user settings.
 * Currently contains non-functional controls for demonstration.
 *
 * @returns {React.ReactElement} The rendered settings section.
 */
const UserSettings: React.FC = () => {
  return (
    <Card title={<Title level={4}>Settings</Title>}>
      <Title level={3} style={{ marginBottom: "24px" }}>
        Account Settings
      </Title>

      <Alert
        message="Settings are placeholders"
        description="These settings are not yet functional and are for demonstration purposes only."
        type="info"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      <Form layout="vertical">
        {/* --- Notifications Section --- */}
        <Title level={4}>Notifications</Title>
        <Form.Item
          label="Receive Email Notifications"
          valuePropName="checked"
          help="Get updates about orders, promotions, and news."
        >
          <Switch disabled />
        </Form.Item>
        <Form.Item
          label="Receive SMS Alerts (if phone provided)"
          valuePropName="checked"
          help="Critical alerts only."
        >
          <Switch disabled />
        </Form.Item>

        <Divider />

        {/* --- Preferences Section --- */}
        <Title level={4}>Preferences</Title>
        <Form.Item
          label="Preferred Theme"
          help="Light/Dark mode preference (requires implementation)"
        >
          {/* Placeholder for theme selection - could be Select or Radio.Group */}
          <Text type="secondary">System Default (Not Configurable Yet)</Text>
        </Form.Item>
        <Form.Item
          label="Data Preferences"
          valuePropName="checked"
          help="Allow usage data collection to improve services."
        >
          <Checkbox disabled>Allow Anonymous Usage Statistics</Checkbox>
        </Form.Item>

        <Divider />

        {/* --- Security Section --- */}
        <Title level={4}>Security</Title>
        <Form.Item
          label="Two-Factor Authentication (2FA)"
          valuePropName="checked"
          help="Enhance account security."
        >
          <Switch disabled />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Button type="primary" disabled>
            Save Settings
          </Button>
          <Text type="secondary" style={{ marginLeft: "10px" }}>
            (Functionality not implemented yet)
          </Text>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default UserSettings;
