import React from "react";
import { Card, Row, Col, Select, Input, Space, Typography } from "antd";

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

/**
 * @description Props for the GameFilters component.
 */
interface GameFiltersProps {
  category: string;
  sortBy: string;
  searchTerm: string; // Current search term for default value
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onSearch: (value: string) => void;
  // Add isLoading prop if you want to disable controls during search/filter
  // isLoading?: boolean;
}

/**
 * @description Component providing UI controls for filtering, sorting, and searching games.
 * @param {GameFiltersProps} props The component props.
 * @returns {React.FC<GameFiltersProps>} The GameFilters component.
 */
const GameFilters: React.FC<GameFiltersProps> = ({
  category,
  sortBy,
  searchTerm,
  onCategoryChange,
  onSortChange,
  onSearch,
  // isLoading = false,
}) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]} align="bottom">
        {" "}
        {/* Align items to bottom */}
        {/* Category Col */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Category:</Text>
            <Select
              value={category} // Controlled component
              style={{ width: "100%" }}
              onChange={onCategoryChange}
              // disabled={isLoading}
            >
              <Option value="all">All</Option>
              <Option value="pc">PC</Option>
              <Option value="console">Console</Option>
              <Option value="mobile">Mobile</Option>
            </Select>
          </Space>
        </Col>
        {/* Sort Col */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Sort By:</Text>
            <Select
              value={sortBy} // Controlled component
              style={{ width: "100%" }}
              onChange={onSortChange}
              // disabled={isLoading}
            >
              <Option value="title_asc">Title (A-Z)</Option>
              <Option value="title_desc">Title (Z-A)</Option>
              <Option value="price_asc">Price (Low-High)</Option>
              <Option value="price_desc">Price (High-Low)</Option>
            </Select>
          </Space>
        </Col>
        {/* Search Col */}
        <Col xs={24} sm={24} md={8} lg={12}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Search:</Text>
            <Search
              placeholder="Search by title..."
              allowClear
              enterButton
              onSearch={onSearch}
              style={{ width: "100%" }}
              defaultValue={searchTerm} // Reflect search state (optional)
              // disabled={isLoading}
              // loading={isLoading} // Show loading indicator on search button
            />
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default GameFilters;
