import React from "react";
import { Card, Typography, Button, Tag, Space, Image, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/types/game";

const { Title, Text, Paragraph } = Typography;

interface GameCardProps {
  game: Game;
  onAddToCart?: (game: Game) => void;
  isAddingToCart?: boolean;
  className?: string;
}

/**
 * @description Displays game information. Handles missing price.
 * @param {GameCardProps} props Component props.
 * @returns {React.ReactElement} The rendered GameCard component.
 */
const GameCard: React.FC<GameCardProps> = ({
  game,
  onAddToCart,
  isAddingToCart,
  className,
}) => {
  const {
    id,
    title,
    thumbnail,
    price,
    discountedPrice,
    category,
    description,
  } = game;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(game);
  };

  const displayPrice = price >= 0;

  return (
    <Card
      hoverable
      className={className}
      style={{ width: "100%", overflow: "hidden" }}
      cover={
        <Image
          alt={title}
          src={thumbnail}
          style={{ height: 180, objectFit: "cover" }}
          preview={false}
          fallback="/placeholder-image.jpg"
        />
      }
      actions={[
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          key={`add-${id}`}
          disabled={!onAddToCart || isAddingToCart}
          loading={isAddingToCart}
        >
          {displayPrice ? "Add to Cart" : "Details"}
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <Title level={5} ellipsis={{ rows: 1, tooltip: title }}>
            {title}
          </Title>
        }
        description={
          <Space direction="vertical" style={{ width: "100%" }}>
            <Tag color="blue">{category}</Tag>
            {description && (
              <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                {description}
              </Paragraph>
            )}
            {displayPrice ? (
              <Space align="baseline" wrap size="small">
                <Text strong style={{ fontSize: "1.1em" }}>
                  ${price.toFixed(2)}
                </Text>
              </Space>
            ) : (
              <Text type="secondary" style={{ fontStyle: "italic" }}>
                Price unavailable
              </Text>
            )}
          </Space>
        }
      />
    </Card>
  );
};

export default GameCard;
