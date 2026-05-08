import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    const engEmail = localStorage.getItem("eng_userEmail");
    if (engEmail) {
      navigate("/user");
    } else {
      setShowAuth(true);
    }
  };

  const handleSavedClick = () => {
    const engEmail = localStorage.getItem("eng_userEmail");
    if (engEmail) {
      navigate("/saved-posts");
    } else {
      setShowAuth(true);
    }
  };

  return (
    <>
      {/* 🔴 Top Navbar - Solid & Vibrant */}
      <nav className="bg-[#050507] text-white px-6 py-5 flex justify-between items-center sticky top-0 z-50 border-b-2 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        
        {/* 🔴 Logo Section */}
        <div 
          className="flex flex-col cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate("/")}
        >
          <h1 className="font-black text-2xl italic tracking-tighter leading-none text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            LEARN-<span className="text-yellow-400">IGLISH</span>
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500/80 leading-relaxed italic">
            Serial Learners
          </span>
        </div>

        {/* ☰ Hamburger - Neon Border Style */}
        <button
          onClick={() => setOpen(true)}
          className="w-11 h-11 flex items-center justify-center bg-white/5 border-2 border-white/20 rounded-xl hover:border-yellow-400 hover:bg-yellow-400/10 transition-all active:scale-90"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="18" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      {/* 🔲 Overlay - Darker Blur */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 📱 Sidebar - High Contrast Bold Style */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a0f] border-l-2 border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ❌ Close Section */}
        <div className="flex justify-between items-center p-7 border-b-2 border-white/5 bg-white/5">
            <h2 className="font-black text-white text-[12px] uppercase tracking-[0.3em]">Menu Control</h2>
            <button 
             onClick={() => setOpen(false)} 
             className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
           >
             ✕
           </button>
        </div>

        {/* 📌 Navigation Links - Vivid Neon Accents */}
        <div className="mt-6 px-5 space-y-3 overflow-y-auto flex-1">
          {[
            { label: "🏠 Home", path: "/" },
            { label: "🔍 Find Vocab", path: "/find-vocab", color: "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]" },
            { label: "📱 Community Post", path: "/community", color: "border-purple-500 bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)]" },
            { label: "📥 My Saved Vault", onClick: handleSavedClick, color: "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]" },
            { label: "📚 E-Book Store", path: "/ebook-store", color: "border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)]" },
            { label: "⭐ Upgrade Plan", path: "/upgrade", color: "border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" },
            { label: "👤 My Profile", onClick: handleUserClick, color: "mt-8 border-white/20 bg-white/10 text-white shadow-xl" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setOpen(false);
              }}
              className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 font-black flex items-center gap-4 border-2
                ${item.color ? item.color : 'border-white/5 text-gray-300 hover:border-white/40 hover:text-white'}
                uppercase text-[12px] tracking-tighter hover:scale-[1.02] active:scale-95`}
            >
              {item.label}
            </button>
          ))}
        </div>


        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
        `}} />
      </div>

      {showAuth && (
        <SignInModal onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}