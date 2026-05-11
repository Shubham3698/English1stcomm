import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import NotificationPanel from "./NotificationPanel"; // ✅ Is naye component ko import karo
import toast from "react-hot-toast";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // ✅ Notification control
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 🔄 Check Login Status on Mount
  useEffect(() => {
    const user = localStorage.getItem("eng_userEmail");
    setIsLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eng_userEmail");
    localStorage.removeItem("eng_userName");
    localStorage.removeItem("eng_fcmToken");
    setIsLoggedIn(false);
    setOpen(false);
    toast.error("Logged Out Successfully! 🚪", {
        style: { background: '#000', color: '#fff', border: '1px solid #333' }
    });
    navigate("/");
  };

  const handleUserAction = (path) => {
    const user = localStorage.getItem("eng_userEmail");
    if (user) {
      navigate(path);
    } else {
      setShowAuth(true);
    }
    setOpen(false);
  };

  return (
    <>
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

        {/* 🔴 Right Side Icons */}
        <div className="flex items-center gap-4">
            
            {/* 🔔 Notification Bell Icon (Added Here) */}
            {isLoggedIn && (
                <div 
                    onClick={() => setShowNotifications(true)}
                    className="relative w-10 h-10 flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-xl cursor-pointer hover:border-yellow-400 transition-all active:scale-90"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 hover:text-yellow-400">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {/* Pulsing Red Badge */}
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#050507] animate-pulse"></span>
                </div>
            )}

            {/* Quick Profile Check */}
            {isLoggedIn && (
                <div 
                    onClick={() => navigate("/user")}
                    className="w-10 h-10 rounded-full border-2 border-yellow-400/50 overflow-hidden cursor-pointer active:scale-90 transition-all shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                >
                    <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("eng_userName")}`} 
                        alt="user" 
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* ☰ Hamburger */}
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
        </div>
      </nav>

      {/* 🔲 Overlay for Sidebar */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 📱 Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#0a0a0f] border-l-2 border-white/10 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-7 border-b-2 border-white/5 bg-white/5">
            <h2 className="font-black text-white text-[12px] uppercase tracking-[0.3em]">Menu Control</h2>
            <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">✕</button>
        </div>

        <div className="mt-6 px-5 space-y-3 overflow-y-auto flex-1">
          {[
            { label: "🏠 Home Page", path: "/home", color: "border-white/10 bg-white/5 text-gray-400" },
            { label: "📱 Community Post", path: "/", color: "border-purple-500 bg-purple-500/10 text-purple-400" },
            { label: "🔍 Find Vocab", path: "/find-vocab", color: "border-blue-500 bg-blue-500/10 text-blue-400" },
            { label: "📥 My Saved Vault", onClick: () => handleUserAction("/saved-posts"), color: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
            { label: "📚 E-Book Store", path: "/ebook-store", color: "border-pink-500 bg-pink-500/10 text-pink-400" },
            { label: "⭐ Upgrade Plan", path: "/upgrade", color: "border-yellow-500 bg-yellow-500/10 text-yellow-500" },
            { label: "👤 My Profile", onClick: () => handleUserAction("/user"), color: "mt-8 border-white/20 bg-white/10 text-white" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setOpen(false);
              }}
              className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 font-black flex items-center gap-4 border-2
                ${item.color} uppercase text-[12px] tracking-tighter hover:scale-[1.02] active:scale-95`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isLoggedIn && (
            <div className="p-5 border-t-2 border-white/5 bg-white/5">
                <button onClick={handleLogout} className="w-full py-4 bg-red-600/10 border-2 border-red-600 text-red-500 font-black uppercase text-[12px] tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                    🚪 Quick Logout
                </button>
            </div>
        )}
      </div>

      {/* ✅ Notification Panel (Overlay) */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {showAuth && (
        <SignInModal onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}