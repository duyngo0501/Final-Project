import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import "./index.css";
import "antd/dist/reset.css";

import { StrictMode } from "react";
import setupLocatorUI from "@locator/runtime";

if (process.env.NODE_ENV === "development") {
  setupLocatorUI();
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
