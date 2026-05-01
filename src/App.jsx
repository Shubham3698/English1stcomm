import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CommunityPost from "./pages/CommunityPost";
import User from "./pages/User"; 
import EnglishAppMyPosts from "./pages/EnglishAppMyPosts"; // 👈 1. Isse pehle import karo

export default function App() {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "i")) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <BrowserRouter>
      <div
        onContextMenu={(e) => e.preventDefault()}
        style={{ background: "#f1f2f6", minHeight: "100vh" }}
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/community" element={<CommunityPost />} />
          <Route path="/user" element={<User />} /> 
          
          {/* 👈 2. Ye naya route add kiya taaki error hat jaye */}
          <Route path="/my-posts" element={<EnglishAppMyPosts />} /> 
        </Routes>
      </div>
    </BrowserRouter>
  );
}