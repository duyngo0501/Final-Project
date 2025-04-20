import React from "react";
import { Row, Col, Card, Button, Typography, Image, Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/types/game"; // Import shared Game type using alias
import GameCard from "@/components/game/GameCard"; // <-- Import GameCard
import {
  FixedSizeGrid as VirtualGrid,
  GridChildComponentProps,
} from "react-window";
import { Link } from "react-router-dom"; // Import Link for card navigation

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface GameGridProps {
  games: Game[]; // Use imported Game type
  onQuickBuy: (game: Game) => void; // Use imported Game type
  isCartMutating?: boolean; // Add prop to accept cart loading state
}

/**
 * @description Displays a grid of game cards, with virtualization for performance.
 * @param {GameGridProps} props
 * @returns {React.FC<GameGridProps>}
 */
const GameGrid: React.FC<GameGridProps> = ({
  games,
  onQuickBuy,
  isCartMutating, // Destructure the new prop
}) => {
  if (!games || games.length === 0) {
    return (
      <Paragraph style={{ textAlign: "center", padding: "50px" }}>
        No games found for this category.
      </Paragraph>
    );
  }

  // Virtualization settings
  const CARD_WIDTH = 240;
  const CARD_HEIGHT = 440;
  const GRID_HEIGHT = 600;
  const GRID_COLS = 4;

  // Render a single card (for both grid and list)
  const renderCard = (game: Game) => (
    <Link to={`/games/${game.id}`} style={{ textDecoration: "none" }}>
      <GameCard
        game={game} // Pass game data
        onAddToCart={onQuickBuy} // Pass the quick buy handler
        isAddingToCart={isCartMutating} // Pass down the loading state
      />
    </Link>
  );

  // Always render the virtualized grid view
  const rowCount = Math.ceil(games.length / GRID_COLS);
  return (
    <VirtualGrid
      columnCount={GRID_COLS}
      columnWidth={CARD_WIDTH}
      height={GRID_HEIGHT}
      rowCount={rowCount}
      rowHeight={CARD_HEIGHT}
      width={CARD_WIDTH * GRID_COLS + 32}
    >
      {({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const gameIndex = rowIndex * GRID_COLS + columnIndex;
        if (gameIndex >= games.length) return null;
        return (
          <div
            style={{
              ...style,
              padding: 8,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderCard(games[gameIndex])}
          </div>
        );
      }}
    </VirtualGrid>
  );
};

export default GameGrid;
