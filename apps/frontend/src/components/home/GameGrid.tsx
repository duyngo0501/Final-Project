import React from "react";
import { Row, Col, Card, Button, Typography, Image, Tag } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Game } from "@/gen/types"; // USE GameWithRelations
import GameCard from "@/components/game/GameCard"; // <-- Import GameCard
import AutoSizer from "react-virtualized-auto-sizer"; // Import AutoSizer
import {
  FixedSizeGrid as VirtualGrid,
  GridChildComponentProps,
} from "react-window";
import { Link } from "react-router-dom"; // Import Link for card navigation

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface GameGridProps {
  games: Game[]; // Use generated type
  // Remove unused props
  // onQuickBuy: (game: GameWithRelations) => void;
  // isCartMutating?: boolean;
}

/**
 * @description Displays a grid of game cards, with virtualization for performance.
 * @param {GameGridProps} props
 * @returns {React.FC<GameGridProps>}
 */
const GameGrid: React.FC<GameGridProps> = ({
  games,
  // onQuickBuy, // Removed prop
  // isCartMutating, // Removed prop
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

  // Render a single card (for both grid and list)
  const renderCard = (game: GameWithRelations) => (
    <Link to={`/game-detail?id=${game.id}`} style={{ textDecoration: "none" }}>
      <GameCard
        game={game} // Pass game data
        // Remove unused props
        // onAddToCart={onQuickBuy}
        // isAddingToCart={isCartMutating}
      />
    </Link>
  );

  // Always render the virtualized grid view
  return (
    // Wrap with AutoSizer - Parent MUST have dimensions!
    <AutoSizer>
      {({ height, width }: { height: number; width: number }) => {
        // Calculate columns dynamically
        const columnCount = Math.max(1, Math.floor(width / CARD_WIDTH));
        const rowCount = Math.ceil(games.length / columnCount);

        return (
          <VirtualGrid
            columnCount={columnCount} // Use dynamic column count
            columnWidth={CARD_WIDTH}
            height={height} // Use height from AutoSizer
            rowCount={rowCount} // Use dynamic row count
            rowHeight={CARD_HEIGHT}
            width={width} // Use width from AutoSizer
          >
            {({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
              const gameIndex = rowIndex * columnCount + columnIndex;
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
      }}
    </AutoSizer>
  );
};

export default GameGrid;
