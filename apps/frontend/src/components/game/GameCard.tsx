import React, { useState } from "react";
import { Card, Typography, Button, Tag, Space, Image, Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/gen/types";
import { useCart } from "@/contexts/CartContext";

const { Title, Text, Paragraph } = Typography;

interface GameCardProps {
  game: Game;
  className?: string;
}

/**
 * @description Displays game information. Handles adding to cart internally.
 * @param {GameCardProps} props Component props.
 * @returns {React.ReactElement} The rendered GameCard component.
 */
const GameCard: React.FC<GameCardProps> = ({ game, className }) => {
  const { addItem } = useCart();

  const [isAddingThisItem, setIsAddingThisItem] = useState(false);

  const { id, name, background_image, price, description } = game;

  const displayPrice = price !== null && price !== undefined;

  const handleLocalAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(`[GameCard ${id}] Setting loading state to true`);
    setIsAddingThisItem(true);
    try {
      console.log(`[GameCard ${id}] Calling addItem...`);
      await addItem(id, 1);
      console.log(`[GameCard ${id}] addItem finished successfully.`);
    } catch (error) {
      console.error(`[GameCard ${id}] Error adding item:`, error);
    } finally {
      console.log(`[GameCard ${id}] Setting loading state back to false`);
      setIsAddingThisItem(false);
    }
  };

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
          onClick={handleLocalAddToCart}
          key={`add-${id}`}
          disabled={isAddingThisItem || price === null || price === undefined}
          loading={isAddingThisItem}
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
