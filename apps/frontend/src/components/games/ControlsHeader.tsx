import React from "react";
import { Row, Col, Typography, Select, Input, Space, Radio } from "antd";
import { SearchProps } from "antd/es/input/Search";
import { SelectProps } from "antd/es/select";
import { RadioChangeEvent } from "antd/es/radio";

const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface ControlsHeaderProps {
  searchInput: string;
  sortOption: string;
  viewMode: "grid" | "list";
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: SelectProps["onChange"];
  onViewModeChange: (e: RadioChangeEvent) => void;
}

/**
 * @description Header component containing search, sort, and view mode controls.
 * @param {ControlsHeaderProps} props
 * @returns {React.FC<ControlsHeaderProps>}
 */
const ControlsHeader: React.FC<ControlsHeaderProps> = ({
  searchInput,
  sortOption,
  viewMode,
  onSearchChange,
  onSortChange,
  onViewModeChange,
}) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
      <Col>
        <Search
          aria-label="Search games"
          placeholder="Search games..."
          value={searchInput}
          onChange={onSearchChange}
          style={{ width: 300 }}
          allowClear
        />
      </Col>
      <Col>
        <Space align="center">
          <label htmlFor="sort-select">Sort by:</label>
          <Select
            id="sort-select"
            defaultValue="default"
            style={{ width: 150 }}
            onChange={onSortChange}
            value={sortOption}
            aria-label="Sort games by"
          >
            <Option value="default">Relevance</Option>
            <Option value="price_asc">Price: Low to High</Option>
            <Option value="price_desc">Price: High to Low</Option>
            <Option value="name_asc">Name: A-Z</Option>
            <Option value="name_desc">Name: Z-A</Option>
            {/* Consider adding back date/rating sort options here */}
          </Select>
          <Radio.Group
            aria-label="Select view mode"
            options={[
              { label: "Grid", value: "grid" },
              { label: "List", value: "list" },
            ]}
            onChange={onViewModeChange}
            value={viewMode}
            optionType="button"
            buttonStyle="solid"
          />
        </Space>
      </Col>
    </Row>
  );
};

export default ControlsHeader;
