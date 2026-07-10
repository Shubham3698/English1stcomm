import { Toaster } from 'react-hot-toast';
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast from "react-hot-toast"; 

// ✅ Firebase functions import karo
import { requestForToken, onMessageListener } from "./firebase"; 

import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav"; 
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

// ✅ 1. Apna naya Lessons page import karo (path apne folder structure ke hisaab se check kar lena)
import LessonsPage from "./pages/LessonsPage"; 

export default function App() {
  const userEmail = localStorage.getItem("eng_userEmail");

  useEffect(() => {
    // 1. 🛡️ Security: Disable Right Click & F12
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
      requestForToken(userEmail);
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
            background: '#121c2d', // ✅ Toast ko bhi dark theme diya
            color: '#fff',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '10px',
            border: '1px solid #1e293b'
          }
        }}
      />

      <div
        onContextMenu={(e) => e.preventDefault()}
        // ✅ 2. Background color update kiya dark theme (#0b101a) ke liye
        style={{ background: "#0b101a", minHeight: "100vh", paddingBottom: "80px", position: "relative" }}
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
          
          {/* ✅ 3. Yahan par naya route add kar diya */}
          <Route path="/lessons" element={<LessonsPage />} />
        </Routes>

        {/* ✅ Bottom Navbar */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}