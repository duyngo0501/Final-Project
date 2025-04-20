import React from "react";
import { Carousel, Image } from "antd";

// Placeholder data for banner slides
const bestSellingGames = [
  { id: 1, title: "Game A", imageUrl: "/images/banner1.jpg", link: "/games/a" },
  { id: 2, title: "Game B", imageUrl: "/images/banner2.jpg", link: "/games/b" },
  { id: 3, title: "Game C", imageUrl: "/images/banner3.jpg", link: "/games/c" },
];

const contentStyle: React.CSSProperties = {
  margin: 0,
  height: "400px", // Adjust height as needed
  color: "#fff",
  lineHeight: "400px",
  textAlign: "center",
  background: "#364d79", // Fallback background
};

/**
 * @description Banner header slideshow displaying best-selling games.
 * Uses Ant Design Carousel component.
 * @returns {React.FC} The BannerHeader component.
 */
const BannerHeader: React.FC = () => {
  return (
    <Carousel autoplay dotPosition="bottom" style={{ marginBottom: "20px" }}>
      {bestSellingGames.map((game) => (
        <div key={game.id}>
          <a href={game.link}>
            <Image
              src={game.imageUrl}
              alt={game.title}
              preview={false}
              style={{
                ...contentStyle,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }} // Ensure image covers the area
            />
            {/* Optional: Add title overlay if needed */}
            {/* <h3 style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white' }}>{game.title}</h3> */}
          </a>
        </div>
      ))}
    </Carousel>
  );
};

export default BannerHeader;
