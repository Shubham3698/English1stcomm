import { Toaster } from 'react-hot-toast'; // Pehle se import hai, good!
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CommunityPost from "./pages/CommunityPost";
import User from "./pages/User"; 
import EnglishAppMyPosts from "./pages/EnglishAppMyPosts";
import SavedPosts from "./pages/SavedPosts";
import Upgrade from "./pages/Upgrade";
import FindVocab from "./pages/FindVocab";
import EbookStore from "./pages/EbookStore";

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
      {/* ✅ 1. Toaster yahan add karo taaki ye har page par kaam kare */}
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          // Optional: yahan se tu default style bhi set kar sakta hai
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
        style={{ background: "#f1f2f6", minHeight: "100vh" }}
      >
        <Navbar />

      <Routes>
  {/* 🔥 MAIN LANDING: Ab app khulne par seedha Community Post dikhega */}
  <Route path="/" element={<CommunityPost />} />
  
  {/* 📱 DEDICATED COMMUNITY: Purane links ya direct access ke liye bhi wahi page */}
  <Route path="/community" element={<CommunityPost />} />

  {/* 🏠 DASHBOARD/HOME: Tera purana main page ab yahan shift ho gaya hai */}
  <Route path="/home" element={<Home />} />

  {/* 📥 VAULT: User ke saved items yahan milenge */}
  <Route path="/saved-posts" element={<SavedPosts />} />

  {/* 👤 PROFILE: User setting aur information */}
  <Route path="/user" element={<User />} /> 

  {/* ⭐ PLANS: Subscription aur Upgrade logic */}
  <Route path="/upgrade" element={<Upgrade />} />

  {/* 📝 CREATIONS: User ne jo posts banayi hain */}
  <Route path="/my-posts" element={<EnglishAppMyPosts />} /> 

  {/* 🔍 SEARCH: Vocabulary find karne ke liye */}
  <Route path="/find-vocab" element={<FindVocab />} />

  {/* 📚 STORE: E-books purchase aur browsing */}
  <Route path="/ebook-store" element={<EbookStore />} />
</Routes>
      </div>
    </BrowserRouter>
  );
}