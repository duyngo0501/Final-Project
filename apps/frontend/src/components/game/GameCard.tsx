import React from "react";
import { Card, Typography, Button, Tag, Space, Image, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/types/game";

const { Title, Text, Paragraph } = Typography;

interface GameCardProps {
  game: Game;
  onAddToCart?: (game: Game) => void; // Optional callback for adding to cart
  isAddingToCart?: boolean; // Add prop for loading state
  className?: string;
}

/**
 * @description A visually appealing card component to display game information.
 * Shows thumbnail, title, price (with discount handling), category, and an add-to-cart button.
 * @param {GameCardProps} props Component props.
 * @returns {React.ReactElement} The rendered GameCard component.
 */
const GameCard: React.FC<GameCardProps> = ({
  game,
  onAddToCart,
  isAddingToCart, // Destructure the new prop
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
    e.stopPropagation(); // Prevent card click if button is clicked
    onAddToCart?.(game);
  };

  const hasDiscount =
    typeof discountedPrice === "number" && discountedPrice < price;

  return (
    <Card
      hoverable
      className={className}
      style={{ width: "100%", overflow: "hidden" }}
      cover={
        <Image
          alt={title}
          src={
            thumbnail === "/placeholder-image.jpg"
              ? `https://cataas.com/cat/says/game-${id}?width=300&height=180`
              : thumbnail
          }
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
          Add to Cart
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
            <Space align="baseline" wrap size="small">
              {hasDiscount ? (
                <>
                  <Text strong style={{ fontSize: "1.1em", color: "#f5222d" }}>
                    ${discountedPrice?.toFixed(2)}
                  </Text>
                  <Text delete type="secondary">
                    ${price.toFixed(2)}
                  </Text>
                </>
              ) : (
                <Text strong style={{ fontSize: "1.1em" }}>
                  ${price.toFixed(2)}
                </Text>
              )}
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default GameCard;
