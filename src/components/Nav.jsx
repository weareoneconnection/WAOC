// src/components/Nav.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const ITEMS = [
  { to: "/", label: "Home" },
  { to: "/session", label: "Session" },
  { to: "/meditate", label: "Meditate" },
  { to: "/library", label: "Library" },
  { to: "/about", label: "About" },
  { to: "/settings", label: "Settings" },
];

export default function Nav() {
  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"} // ✅ Home 只在 / 激活
            style={({ isActive }) => ({
              ...styles.pill,
              ...(isActive ? styles.pillActive : null),
            })}
          >
            {it.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 18px",
  },
  inner: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    height: 36,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid rgba(11,15,26,0.14)",
    textDecoration: "none",
    color: "#0b0f1a",
    fontWeight: 650,
    fontSize: 13,
    background: "#fff",
  },
  pillActive: {
    background: "#0b0f1a",
    color: "#fff",
    borderColor: "#0b0f1a",
  },
};
