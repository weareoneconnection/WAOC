// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout.jsx";

import Home from "./pages/Home.jsx";
import Session from "./pages/Session.jsx";
import Meditate from "./pages/Meditate.jsx";
import Library from "./pages/Library.jsx";
import About from "./pages/About.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 全站统一布局 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/session" element={<Session />} />
          <Route path="/meditate" element={<Meditate />} />
          <Route path="/library" element={<Library />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* 兜底 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
