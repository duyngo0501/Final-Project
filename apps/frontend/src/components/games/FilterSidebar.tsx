import React from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  Select,
  Slider,
  Rate,
  Button,
  Divider,
  Space,
  Checkbox,
  DatePicker,
  Form,
  Alert,
} from "antd";
import { Dayjs } from "dayjs";

const { Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterSidebarProps {
  minPrice: number;
  maxPrice: number;
  categories: string[];
  platforms: string[];
  selectedCategory: string;
  priceRange: [number, number];
  selectedRating: number | null;
  selectedPlatforms: string[];
  releaseDateRange: [Dayjs | null, Dayjs | null];
  onClearFilters: () => void;
  onCategoryChange: (value: string) => void;
  onPriceChange: (value: number[]) => void;
  onRatingChange: (value: number | null) => void;
  onPlatformChange: (checkedValues: string[]) => void;
  onReleaseDateChange: (dates: any) => void; // TODO: Type this properly
  ratingOptions: { value: number; label: string }[];
}

/**
 * @description Sidebar component containing game filters.
 * @param {FilterSidebarProps} props
 * @returns {React.FC<FilterSidebarProps>}
 */
const FilterSidebar: React.FC<FilterSidebarProps> = ({
  minPrice,
  maxPrice,
  categories,
  platforms,
  selectedCategory,
  priceRange,
  selectedRating,
  selectedPlatforms,
  releaseDateRange,
  onClearFilters,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  onPlatformChange,
  onReleaseDateChange,
  ratingOptions,
}) => {
  return (
    <Sider width={250} style={{ background: "#fff", padding: "20px" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={4} style={{ marginBottom: 0 }}>
            Filters
          </Title>
        </Col>
        <Col>
          <Button type="link" onClick={onClearFilters} size="small">
            Clear All
          </Button>
        </Col>
      </Row>
      <Divider style={{ marginTop: 8, marginBottom: 16 }} />
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Form.Item label="Category" style={{ marginBottom: 0 }}>
          <Select
            defaultValue="All"
            style={{ width: "100%", marginTop: 8 }}
            onChange={onCategoryChange}
            value={selectedCategory}
            aria-label="Filter by category"
          >
            <Option value="All">All Categories</Option>
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Price Range" style={{ marginBottom: 0 }}>
          <Slider
            range
            min={minPrice}
            max={maxPrice}
            defaultValue={[minPrice, maxPrice]}
            value={priceRange}
            onChange={onPriceChange}
            tipFormatter={(value) => `$${value}`}
            style={{ marginTop: 8 }}
            aria-label={`Price range slider, currently ${
              priceRange?.[0] ?? minPrice
            } to ${priceRange?.[1] ?? maxPrice}`}
          />
          <Row justify="space-between">
            <Col>
              <Text type="secondary">${priceRange?.[0] ?? minPrice}</Text>
            </Col>
            <Col>
              <Text type="secondary">${priceRange?.[1] ?? maxPrice}</Text>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item label="Minimum Rating" style={{ marginBottom: 0 }}>
          <Select
            allowClear
            placeholder="Any Rating"
            style={{ width: "100%", marginTop: 8 }}
            onChange={onRatingChange}
            value={selectedRating}
            aria-label="Filter by minimum rating"
          >
            {ratingOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                <Rate
                  disabled
                  defaultValue={opt.value}
                  style={{ fontSize: 14, marginRight: 8 }}
                />
                {opt.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Platforms" style={{ marginBottom: 0 }}>
          <Checkbox.Group
            options={platforms}
            value={selectedPlatforms}
            onChange={onPlatformChange}
            style={{ width: "100%", marginTop: 8 }}
            aria-label="Filter by platform"
          />
        </Form.Item>

        <Form.Item label="Release Date" style={{ marginBottom: 0 }}>
          <RangePicker
            value={releaseDateRange}
            onChange={onReleaseDateChange}
            style={{ width: "100%", marginTop: 8 }}
            aria-label="Filter by release date range"
          />
        </Form.Item>
      </Space>
    </Sider>
  );
};

export default FilterSidebar;
