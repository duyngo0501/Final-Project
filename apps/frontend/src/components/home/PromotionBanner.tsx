import React from "react";
import { Carousel, Image, Typography } from "antd";

const { Title } = Typography;

// Placeholder data for promotion slides
const promotions = [
  {
    id: 1,
    title: "Summer Sale!",
    description: "Up to 50% off select PC games!",
    imageUrl: "/images/promo1.jpg",
    link: "/sales/summer",
  },
  {
    id: 2,
    title: "Console Bundles",
    description: "Get a free game with any console purchase!",
    imageUrl: "/images/promo2.jpg",
    link: "/deals/console-bundles",
  },
  {
    id: 3,
    title: "Mobile Madness",
    description: "New mobile games added weekly.",
    imageUrl: "/images/promo3.jpg",
    link: "/games/mobile",
  },
];

const contentStyle: React.CSSProperties = {
  position: "relative", // Needed for absolute positioning of text
  margin: 0,
  height: "300px", // Adjust height as needed
  color: "#fff",
  lineHeight: "300px",
  textAlign: "center",
  background: "#5a8eff", // Fallback background
};

const textOverlayStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "20px",
  left: "20px",
  textAlign: "left",
  backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  padding: "10px 15px",
  borderRadius: "5px",
  lineHeight: "normal", // Reset line height for text block
};

/**
 * @description Promotion banner slideshow displaying discounts and offers.
 * Uses Ant Design Carousel component.
 * @returns {React.FC} The PromotionBanner component.
 */
const PromotionBanner: React.FC = () => {
  return (
    <Carousel autoplay arrows style={{ marginBottom: "30px" }}>
      {promotions.map((promo) => (
        <div key={promo.id}>
          <a
            href={promo.link}
            style={{ display: "block", position: "relative" }}
          >
            <Image
              src={`https://cataas.com/cat/says/promo-${promo.id}?width=800&height=300`}
              alt={promo.title}
              preview={false}
              style={{
                ...contentStyle,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div style={textOverlayStyle}>
              <Title level={3} style={{ color: "white", marginBottom: "5px" }}>
                {promo.title}
              </Title>
              <p style={{ color: "#eee", margin: 0 }}>{promo.description}</p>
            </div>
          </a>
        </div>
      ))}
    </Carousel>
  );
};

export default PromotionBanner;
