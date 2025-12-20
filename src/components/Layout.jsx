// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Nav from "./Nav.jsx";

export default function Layout() {
  return (
    <div style={styles.shell}>
      <Nav />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#fff",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 18px 48px",
  },
};
