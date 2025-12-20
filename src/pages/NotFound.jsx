// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: 0 }}>404</h2>
      <p style={{ marginTop: 10, color: "rgba(11,15,26,0.65)" }}>Route not found.</p>
      <Link to="/" style={{ color: "#4f46e5" }}>
        Back Home
      </Link>
    </div>
  );
}
