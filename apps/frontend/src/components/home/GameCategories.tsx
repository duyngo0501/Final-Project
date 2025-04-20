import React from "react";
import { Tabs } from "antd";
import {
  LaptopOutlined,
  TabletOutlined,
  MobileOutlined,
} from "@ant-design/icons"; // Example icons

const { TabPane } = Tabs;

interface GameCategoriesProps {
  onCategoryChange: (categoryKey: string) => void;
}

/**
 * @description Tabs component for filtering games by category (PC, Console, Mobile).
 * Triggers a callback when the active tab changes.
 * @param {GameCategoriesProps} props Component props.
 * @param {function} props.onCategoryChange Callback function invoked with the new category key when the tab changes.
 * @returns {React.FC<GameCategoriesProps>} The GameCategories component.
 */
const GameCategories: React.FC<GameCategoriesProps> = ({
  onCategoryChange,
}) => {
  return (
    <Tabs defaultActiveKey="pc" onChange={onCategoryChange} centered>
      <TabPane
        tab={
          <span>
            <LaptopOutlined />
            PC Games
          </span>
        }
        key="pc"
      />
      <TabPane
        tab={
          <span>
            <TabletOutlined /> {/* Using Tablet for Console as an example */}
            Console Games
          </span>
        }
        key="console"
      />
      <TabPane
        tab={
          <span>
            <MobileOutlined />
            Mobile Games
          </span>
        }
        key="mobile"
      />
      {/* Add more categories as needed */}
    </Tabs>
  );
};

export default GameCategories;
