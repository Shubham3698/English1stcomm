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
      {/* 🔴 Top Navbar - Sharp & Sleek */}
      <nav className="bg-[#0f0f15] text-white px-5 py-4 flex justify-between items-center sticky top-0 z-50 border-b border-white/5 font-sans">
        
        {/* 🔴 Logo Section */}
        <div 
          className="flex flex-col cursor-pointer active:scale-95 transition-transform"
          onClick={() => navigate("/")}
        >
          <h1 className="font-black text-xl italic tracking-tighter leading-none text-white">
            LEARN-IGLISH
          </h1>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-500 leading-relaxed italic">
            Serial Learners
          </span>
        </div>

        {/* ☰ Hamburger - Rectangular Sharp Icon */}
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all active:scale-90"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="16" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </nav>

      {/* 🔲 Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 📱 Sidebar - Sharp Rectangle Style */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[#14141b] border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-400 ease-in-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ❌ Close Section */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/[0.02]">
           <h2 className="font-bold text-gray-500 text-[10px] uppercase tracking-[0.2em]">Navigation</h2>
           <button 
            onClick={() => setOpen(false)} 
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* 📌 Navigation Links - Sharp Corners (rounded-lg) */}
        <div className="mt-4 px-4 space-y-2 overflow-y-auto flex-1">
          {[
            { label: "🏠 Home", path: "/" },
            { label: "🔍 Find Vocab", path: "/find-vocab", color: "border-blue-500/30 bg-blue-500/5 text-blue-400" },
            { label: "📱 Community Post", path: "/community" },
            { label: "📥 My Saved Vault", onClick: handleSavedClick },
            { label: "📚 E-Book Store", path: "/ebook-store", color: "border-red-500/30 bg-red-500/5 text-red-400" },
            { label: "⭐ Upgrade Plan", path: "/upgrade", color: "border-orange-500/30 bg-orange-500/5 text-orange-400" },
            { label: "👤 My Profile", onClick: handleUserClick, color: "mt-6 border-white/10 bg-white/5" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-4 rounded-lg transition-all duration-200 font-bold flex items-center gap-3 border border-transparent
                ${item.color ? item.color : 'text-gray-400 hover:bg-white/5 hover:border-white/10 hover:text-white'}
                uppercase text-[11px] tracking-widest`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 🚀 Logout Button - Square Edges but Slightly Softened */}
        {localStorage.getItem("eng_userEmail") && (
            <div className="p-4 mb-6">
                <button 
                    onClick={() => {
                        localStorage.removeItem("eng_userEmail");
                        localStorage.removeItem("eng_userName");
                        localStorage.removeItem("eng_isPremium");
                        setOpen(false);
                        navigate("/");
                    }}
                    className="group relative w-full py-4 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden transition-all active:scale-95 shadow-lg"
                >
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shine transition-all duration-500" 
                         style={{ animation: 'shine 2s infinite' }} 
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Logout Session
                    </span>
                </button>
            </div>
        )}

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