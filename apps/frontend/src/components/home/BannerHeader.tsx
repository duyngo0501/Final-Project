// import React from "react";
// import { Carousel, Image, Spin, Alert, Typography } from "antd";
// import { Link } from "react-router-dom"; // Import Link for navigation
// import { useGameControllerListGames } from "@/gen/query/GamesHooks"; // Import the hook to fetch real game data
// import { Game } from "@/types/game"; // Import the Game type
// import { GameWithRelations } from "@/gen/types/GameWithRelations";

// const { Text } = Typography;

// // Remove placeholder data
// // const bestSellingGames = [...];

// // Define a fixed height for consistency
// const BANNER_HEIGHT = "400px";

// /**
//  * @description Banner header slideshow displaying featured games.
//  * Fetches game data using useGames hook.
//  * @returns {React.FC} The BannerHeader component.
//  */
// const BannerHeader: React.FC = () => {
//   // Fetch first 3 games
//   const {
//     data: response, // SWR returns raw AxiosResponse
//     isLoading, // SWR provides isLoading
//     error, // SWR error object
//     mutate, // SWR mutate function
//   } = useGameControllerListGames({
//     limit: 3,
//   });

//   // --- Process API Response --- //
//   const apiResponse = response?.data;

//   // Style for the container of loading/error/empty states
//   const stateContainerStyle: React.CSSProperties = {
//     height: BANNER_HEIGHT,
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f2f5", // Use a standard Ant Design background color
//   };

//   if (isLoading) {
//     return (
//       <div style={stateContainerStyle}>
//         <Spin size="large" tip="Loading Games..." />
//       </div>
//     );
//   }

//   if (error) {
//     // Check SWR error object
//     return (
//       <div style={stateContainerStyle}>
//         <Alert
//           message="Error Loading Banner"
//           description={
//             // FIX: Extract error message safely
//             error instanceof Error
//               ? error.message
//               : typeof error === "object" &&
//                   error !== null &&
//                   "message" in error
//                 ? String(error.message)
//                 : "Could not load featured games."
//           }
//           type="error"
//           showIcon
//         />
//       </div>
//     );
//   }

//   // Access items from apiResponse
//   if (!apiResponse || apiResponse.items.length === 0) {
//     return (
//       <div style={stateContainerStyle}>
//         {/* Use Ant Design Typography for empty state message */}
//         <Text type="secondary">No featured games available.</Text>
//       </div>
//     );
//   }

//   return (
//     <Carousel autoplay dotPosition="bottom" style={{ marginBottom: "20px" }}>
//       {/* Map over fetched games data */}
//       {apiResponse.items.map((game: GameWithRelations) => (
//         <div key={game.id}>
//           {/* Use Link component for internal navigation with query parameter */}
//           <Link to={`/games?id=${game.id}`}>
//             <Image
//               src={game.background_image!}
//               alt={game.name}
//               preview={false}
//               style={{
//                 // Apply styles directly to Image
//                 width: "100%",
//                 height: BANNER_HEIGHT, // Use defined height
//                 objectFit: "cover", // Ensure image covers the area well
//               }}
//               fallback="/placeholder-image.jpg"
//             />
//           </Link>
//         </div>
//       ))}
//     </Carousel>
//   );
// };

// export default BannerHeader;
