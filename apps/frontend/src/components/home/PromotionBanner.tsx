import React from "react";
import { Carousel, Image, Typography, Button } from "antd";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

// Placeholder data (ensure you have actual images in /public/images/ or use URLs)
const promotions = [
  {
    id: 1,
    title: "Epic Summer Sale!",
    description: "Unlock massive savings on top PC titles!",
    // Replace with your actual high-quality image paths/URLs
    imageUrl:
      "https://via.placeholder.com/1200x400/FFA07A/808080?text=Summer+Sale+Banner",
    link: "/sales/summer",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    title: "Next-Gen Console Deals",
    description: "Exclusive bundles + free game included.",
    imageUrl:
      "https://via.placeholder.com/1200x400/20B2AA/FFFFFF?text=Console+Deals",
    link: "/deals/console-bundles",
    buttonText: "Explore Bundles",
  },
  {
    id: 3,
    title: "Indie Spotlight",
    description: "Discover hidden gems from independent developers.",
    imageUrl:
      "https://via.placeholder.com/1200x400/778899/FFFFFF?text=Indie+Spotlight",
    link: "/games/indie",
    buttonText: "Find Your Next Favorite",
  },
];

// Container for each slide
const slideBaseStyle: React.CSSProperties = {
  position: "relative", // For overlay positioning
  height: "400px", // Increased height
  width: "100%",
  overflow: "hidden", // Hide any image overflow
};

// Style for the image itself
const imageStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover", // Cover the area, might crop
  objectPosition: "center", // Center the image crop
};

// Gradient overlay + text container
const textOverlayStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "0",
  left: "0",
  width: "100%",
  padding: "40px 50px", // Increased padding
  textAlign: "left",
  background:
    "linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%)", // Gradient overlay
  boxSizing: "border-box", // Include padding in width/height
};

/**
 * @description Redesigned promotion banner slideshow with improved styling.
 * Uses Ant Design Carousel component with gradient overlays and optional buttons.
 * @returns {React.FC} The PromotionBanner component.
 */
const PromotionBanner: React.FC = () => {
  return (
    <Carousel
      autoplay
      arrows
      dots={{ className: "slick-dots slick-thumb" }} // Optional: Style dots if needed
      effect="fade" // Use fade effect
      style={{ marginBottom: "40px", borderRadius: "8px", overflow: "hidden" }} // Add border radius and hide overflow
    >
      {promotions.map((promo) => (
        <div key={promo.id} style={slideBaseStyle}>
          {/* Use Link component for routing if the link is internal */}
          <Link to={promo.link}>
            <Image
              // Using placeholder URLs - replace with your actual image URLs or paths
              src={promo.imageUrl}
              alt={promo.title}
              preview={false}
              style={imageStyle} // Apply image specific style
            />
            <div style={textOverlayStyle}>
              <Title
                level={2} // Larger title
                style={{
                  color: "white",
                  marginBottom: "10px",
                  fontWeight: 700, // Bolder title
                  textShadow: "1px 1px 3px rgba(0,0,0,0.4)", // Subtle text shadow
                }}
              >
                {promo.title}
              </Title>
              <Paragraph
                style={{
                  color: "#eee",
                  marginBottom: "20px", // Space before button
                  fontSize: "16px", // Slightly larger description
                  textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                }}
              >
                {promo.description}
              </Paragraph>
              {/* Optional Button */}
              {promo.buttonText && (
                <Button type="primary" size="large">
                  {promo.buttonText}
                </Button>
              )}
            </div>
          </Link>
        </div>
      ))}
    </Carousel>
  );
};

export default PromotionBanner;
