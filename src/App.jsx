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
import Finish from "./pages/Finish.jsx";
import Field from "./pages/Field.jsx"; // ✅ 新增

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* 全站统一布局 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            {/* ✅ 新增：Collective Field */}
            <Route path="/field" element={<Field />} />

            <Route path="/session" element={<Session />} />
            <Route path="/meditate" element={<Meditate />} />
            <Route path="/library" element={<Library />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/finish" element={<Finish />} />
          </Route>

          {/* 兜底 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

/** ✅ 防止白屏：捕获渲染错误并显示错误信息 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // 你想的话可以加日志上报
    // console.error(error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 900, marginBottom: 10, color: "#111827" }}>
            Render error
          </div>
          <pre style={{ whiteSpace: "pre-wrap", color: "red" }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
