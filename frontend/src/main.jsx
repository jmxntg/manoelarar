import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

// React.StrictMode intentionally mounts, unmounts, and remounts components in
// development. Camera libraries such as html5-qrcode can fail during that
// cycle, so the camera app is mounted once in development and production.
createRoot(document.getElementById("root")).render(<App />);
