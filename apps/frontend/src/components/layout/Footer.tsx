// import React from "react";
// import { Layout, Row, Col, Typography } from "antd";
// import {
//   FacebookOutlined,
//   TwitterOutlined,
//   InstagramOutlined,
//   LinkedinOutlined,
// } from "@ant-design/icons";

// const { Footer: AntFooter } = Layout;
// const { Link, Text } = Typography;

// /**
//  * @description The site-wide footer component.
//  * Displays copyright information, relevant links, and social media icons.
//  * @returns {React.FC} The Footer component.
//  */
// const Footer: React.FC = () => {
//   return (
//     <AntFooter style={{ textAlign: "center", backgroundColor: "#f0f2f5" }}>
//       <Row gutter={[16, 16]} justify="center" align="middle">
//         <Col xs={24} sm={12} md={8}>
//           <Text strong>Quick Links</Text>
//           <div>
//             <Link href="/privacy-policy">Privacy Policy</Link>
//           </div>
//           <div>
//             <Link href="/purchase-guide">Purchase Guide</Link>
//           </div>
//           <div>
//             <Link href="/contact">Contact Us</Link>
//           </div>
//         </Col>
//         <Col xs={24} sm={12} md={8}>
//           <Text strong>Follow Us</Text>
//           <div style={{ marginTop: "8px" }}>
//             <Link
//               href="https://facebook.com"
//               target="_blank"
//               style={{ marginRight: "12px" }}
//             >
//               <FacebookOutlined style={{ fontSize: "20px" }} />
//             </Link>
//             <Link
//               href="https://twitter.com"
//               target="_blank"
//               style={{ marginRight: "12px" }}
//             >
//               <TwitterOutlined style={{ fontSize: "20px" }} />
//             </Link>
//             <Link
//               href="https://instagram.com"
//               target="_blank"
//               style={{ marginRight: "12px" }}
//             >
//               <InstagramOutlined style={{ fontSize: "20px" }} />
//             </Link>
//             <Link href="https://linkedin.com" target="_blank">
//               <LinkedinOutlined style={{ fontSize: "20px" }} />
//             </Link>
//           </div>
//         </Col>
//         <Col xs={24} md={8}>
//           <Text strong>GameStore ©{new Date().getFullYear()}</Text>
//           <div>
//             <Text type="secondary">Created with Ant Design</Text>
//           </div>
//         </Col>
//       </Row>
//     </AntFooter>
//   );
// };

// export default Footer;
