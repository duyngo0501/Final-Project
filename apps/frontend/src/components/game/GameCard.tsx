import React from "react";
import { Card, Typography, Button, Tag, Space, Image, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { GameWithRelations, Game } from "@/gen/types";
import { useCart } from "@/contexts/CartContext";

const { Title, Text, Paragraph } = Typography;

interface GameCardProps {
  game: GameWithRelations;
  className?: string;
}

/**
 * @description Displays game information. Handles adding to cart internally.
 * @param {GameCardProps} props Component props.
 * @returns {React.ReactElement} The rendered GameCard component.
 */
const GameCard: React.FC<GameCardProps> = ({ game, className }) => {
  const { addItem, isMutating: isAddingToCart } = useCart();

  const { id, name, background_image, price, categories, description } = game;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addItem(game, 1);
  };

  const displayPrice = price !== null && price !== undefined;

  return (
    <Card
      hoverable
      className={className}
      style={{ width: "100%", overflow: "hidden" }}
      cover={
        <Image
          alt={name}
          src={background_image ?? "/placeholder-image.jpg"}
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
          disabled={isAddingToCart || price === null || price === undefined}
          loading={isAddingToCart}
        >
          {displayPrice ? "Add to Cart" : "Details"}
        </Button>,
      ]}
    >
      <Card.Meta
        title={
          <Title level={5} ellipsis={{ rows: 1, tooltip: name }}>
            {name}
          </Title>
        }
        description={
          <Space direction="vertical" style={{ width: "100%" }}>
            {categories && categories.length > 0 && categories[0].name && (
              <Tag color="blue">{categories[0].name}</Tag>
            )}
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
