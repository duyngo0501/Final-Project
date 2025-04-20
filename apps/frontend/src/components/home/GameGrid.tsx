import React from "react";
import { Row, Col, Card, Button, Typography, Image, Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/types/game"; // Import shared Game type using alias

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface GameGridProps {
  games: Game[]; // Use imported Game type
  onQuickBuy: (game: Game) => void; // Use imported Game type
}

/**
 * @description Displays a grid of game cards.
 * Each card shows game thumbnail, title, price (with discount if applicable),
 * and a quick buy button.
 * @param {GameGridProps} props Component props.
 * @param {Game[]} props.games Array of game objects to display.
 * @param {function} props.onQuickBuy Callback function invoked with the full game object when quick buy button is clicked.
 * @returns {React.FC<GameGridProps>} The GameGrid component.
 */
const GameGrid: React.FC<GameGridProps> = ({ games, onQuickBuy }) => {
  if (!games || games.length === 0) {
    return (
      <Paragraph style={{ textAlign: "center", padding: "50px" }}>
        No games found for this category.
      </Paragraph>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {" "}
      // Adjust gutter as needed
      {games.map((game) => (
        <Col key={game.id} xs={24} sm={12} md={8} lg={6}>
          {" "}
          {/* Adjust column spans for responsiveness */}
          <Card
            hoverable
            cover={
              <Image
                alt={game.title}
                src={
                  game.thumbnail ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                } // Placeholder image
                style={{ height: 200, objectFit: "cover" }}
                preview={false}
              />
            }
            actions={[
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click if button is clicked
                  onQuickBuy(game);
                }}
              >
                Quick Buy
              </Button>,
            ]}
          >
            <Meta
              title={game.title}
              description={
                <>
                  {game.discountedPrice !== undefined ? (
                    <div>
                      <Text delete type="secondary" style={{ marginRight: 8 }}>
                        ${game.price.toFixed(2)}
                      </Text>
                      <Text strong type="danger">
                        ${game.discountedPrice.toFixed(2)}
                      </Text>
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        Sale
                      </Tag>
                    </div>
                  ) : (
                    <Text strong>${game.price.toFixed(2)}</Text>
                  )}
                  {/* Optional: Add a short description here if available */}
                  {/* <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 8 }}>{game.description || ''}</Paragraph> */}
                </>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default GameGrid;
