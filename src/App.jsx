import { Toaster } from 'react-hot-toast';
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ Import toast for foreground notifications

// ✅ Firebase functions import karo
import { requestForToken, onMessageListener } from "./firebase"; 

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav"; // ✅ Naya Bottom Navbar Import Kiya
import Home from "./pages/Home";
import CommunityPost from "./pages/CommunityPost";
import User from "./pages/User"; 
import EnglishAppMyPosts from "./pages/EnglishAppMyPosts";
import SavedPosts from "./pages/SavedPosts";
import Upgrade from "./pages/Upgrade";
import FindVocab from "./pages/FindVocab";
import EbookStore from "./pages/EbookStore";
import InteractiveQuizPage from "./pages/InteractiveQuizPage";
import VocabDeckPage from "./pages/VocabDeckPage";

export default function App() {
  const userEmail = localStorage.getItem("eng_userEmail");

  useEffect(() => {
    // 1. 🛡️ Security: Disable Right Click & F12 (Tera purana logic)
    const handleKey = (e) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "i")) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handleKey);

    // 2. 🔔 Notification System Initializer
    if (userEmail) {
      // 🚀 Token mangne ka function call (Browser permission mangega)
      requestForToken(userEmail);

      // 📡 Foreground Message Listener (Jab app khuli ho tab toast dikhayega)
      onMessageListener()
        .then((payload) => {
          console.log("Foreground Message:", payload);
          toast(
            (t) => (
              <div className="flex flex-col">
                <span className="font-black text-[12px] uppercase italic text-blue-400">
                  {payload.notification.title}
                </span>
                <span className="text-[10px] font-bold text-white">
                  {payload.notification.body}
                </span>
              </div>
            ),
            {
              icon: '📡',
              duration: 5000,
              style: {
                background: '#0d0d0f',
                border: '1px solid #1e1e24',
                padding: '12px',
                borderRadius: '15px'
              },
            }
          );
        })
        .catch((err) => console.log("Foreground notification error:", err));
    }

    return () => document.removeEventListener("keydown", handleKey);
  }, [userEmail]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '10px'
          }
        }}
      />

      <div
        onContextMenu={(e) => e.preventDefault()}
        // ✅ paddingBottom add kiya taaki navbar content cover na kare
        style={{ background: "#f1f2f6", minHeight: "100vh", paddingBottom: "80px", position: "relative" }}
      >
        <Navbar />

        <Routes>
          <Route path="/" element={<CommunityPost />} />
          <Route path="/community" element={<CommunityPost />} />
          <Route path="/home" element={<Home />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          <Route path="/user" element={<User />} /> 
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/my-posts" element={<EnglishAppMyPosts />} /> 
          <Route path="/find-vocab" element={<FindVocab />} />
          <Route path="/ebook-store" element={<EbookStore />} />
          <Route path="/vocab-deck" element={<VocabDeckPage />} />
          <Route path="/interactive-quiz" element={<InteractiveQuizPage />} />
        </Routes>

        {/* ✅ Bottom Navbar Hamesha Dikhne ke liye Routes ke bahar laga diya */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}