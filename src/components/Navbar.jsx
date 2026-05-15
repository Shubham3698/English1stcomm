import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import NotificationPanel from "./NotificationPanel";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const navigate = useNavigate();

  // 🔄 Check Login & Premium Status
  useEffect(() => {
    const checkUser = () => {
      const user = localStorage.getItem("eng_userEmail");
      const premium = localStorage.getItem("eng_isPremium") === "true";
      setIsLoggedIn(!!user);
      setIsPremiumUser(premium);
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("eng_userEmail");
    localStorage.removeItem("eng_userName");
    localStorage.removeItem("eng_fcmToken");
    localStorage.removeItem("eng_isPremium");
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    toast.success("Logged Out! 🚪", {
      style: { background: '#0a0a0f', color: '#fff', border: '1px solid #333' }
    });
    navigate("/");
  };

  const goToPath = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      setShowSignIn(true);
      toast.error("Please Login First! 🛑");
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[#050507] text-white px-6 py-5 flex justify-between items-center sticky top-0 z-[100] border-b-2 border-white/10 shadow-2xl backdrop-blur-md">
        
        {/* 🔴 BRAND LOGO */}
        <div className="flex flex-col cursor-pointer active:scale-95 transition-transform" onClick={() => navigate("/")}>
          <h1 className="font-black text-2xl italic tracking-tighter leading-none">
            LEARN-<span className="text-yellow-400">IGLISH</span>
          </h1>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500/80 italic leading-relaxed">
            Serial Learners
          </span>
        </div>

        {/* 🔴 RIGHT CONTROLS */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* 🔥 DYNAMIC UPGRADE BUTTON (Visible if not premium) */}
          {isLoggedIn && !isPremiumUser && (
            <button 
              onClick={() => navigate("/upgrade")}
              className="hidden sm:flex px-4 py-2 bg-yellow-400/10 border border-yellow-400/50 text-yellow-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-[0_0_15px_rgba(250,205,21,0.2)] animate-pulse"
            >
              Get Pro 💎
            </button>
          )}

          {/* 🔔 NOTIFICATION BELL */}
          <div 
            onClick={() => {
              if (isLoggedIn) setShowNotifications(!showNotifications);
              else { setShowSignIn(true); toast.error("Sign in to check signals! 📡"); }
            }}
            className={`relative w-11 h-11 flex items-center justify-center bg-white/5 border-2 rounded-xl cursor-pointer transition-all active:scale-90
            ${isLoggedIn ? (showNotifications ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 hover:border-yellow-400') : 'border-white/5 opacity-40'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={showNotifications ? "#facd15" : "none"} stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {isLoggedIn && !showNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-[#050507] animate-pulse"></span>
            )}
          </div>

          {/* 👤 PROFILE & PRO BADGE */}
          <div className="relative group">
            <div 
              onClick={() => isLoggedIn ? navigate("/user") : setShowSignIn(true)}
              className={`w-11 h-11 rounded-xl border-2 overflow-hidden cursor-pointer active:scale-90 transition-all flex items-center justify-center
              ${isLoggedIn ? (isPremiumUser ? 'border-yellow-400' : 'border-white/10') : 'border-white/10 bg-white/5 text-gray-500'}`}
            >
              {isLoggedIn ? (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("eng_userName")}`} 
                  alt="user" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            {isLoggedIn && isPremiumUser && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[7px] font-black px-1.5 py-0.5 rounded-md border border-[#050507] shadow-lg">PRO</span>
            )}
          </div>

          {/* ☰ HAMBURGER */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="w-11 h-11 flex items-center justify-center bg-white/5 border-2 border-white/20 rounded-xl hover:border-yellow-400 active:scale-90 group"
          >
            <div className="space-y-1.5">
              <div className="w-6 h-0.5 bg-white"></div>
              <div className="w-4 h-0.5 bg-gray-400 group-hover:w-6 transition-all"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
      </nav>

      {/* 🌑 MENU OVERLAY */}
      <div
        onClick={() => setIsMenuOpen(false)}
        className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] transition-opacity duration-500 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 📱 SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#0a0a0f] border-l-2 border-white/10 z-[120] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 border-b-2 border-white/5 flex justify-between items-center bg-white/2">
            <h2 className="font-black text-white text-[13px] uppercase tracking-[0.4em]">Main Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-4 scrollbar-hide">
          {[
            { label: "Home Page", path: "/home", color: "border-white/5 bg-white/2 text-gray-400" },
            { label: "Community Feed", path: "/", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-500" },
            { label: "Search Words", path: "/find-vocab", color: "border-blue-500/20 bg-blue-500/5 text-blue-400" },
            { label: "Saved Vault", onClick: () => goToPath("/saved-posts"), color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" },
            { label: "E-Book Store", path: "/ebook-store", color: "border-pink-500/20 bg-pink-500/5 text-pink-400" },
            // 🔥 Added Upgrade Route for Non-Premium Users in Mobile Menu
            ...(!isPremiumUser ? [{ label: "PRO Upgrade 💎", path: "/upgrade", color: "border-yellow-400 bg-yellow-400/10 text-yellow-400" }] : []),
            { label: "My Profile", onClick: () => goToPath("/user"), color: "mt-6 border-white/10 bg-white/5 text-white hover:border-yellow-400" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-6 py-4 rounded-2xl transition-all duration-300 font-black border-2
                ${item.color} uppercase text-[11px] tracking-widest active:scale-95`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-8 border-t-2 border-white/5 bg-black/40">
            {isLoggedIn ? (
                <button onClick={handleLogout} className="w-full py-4 bg-red-600/10 border-2 border-red-600/30 text-red-500 font-black uppercase text-[11px] rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                    Logout 🚪
                </button>
            ) : (
                <button onClick={() => { setIsMenuOpen(false); setShowSignIn(true); }} className="w-full py-4 bg-yellow-400 border-2 border-yellow-400 text-black font-black uppercase text-[11px] rounded-2xl hover:bg-white transition-all">
                    Login 🔑
                </button>
            )}
        </div>
      </div>

      {/* 🔔 NOTIFICATION PANEL */}
      <div className={`fixed inset-0 z-[150] pointer-events-none transition-all duration-500 ${showNotifications ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`pointer-events-auto h-full w-full flex justify-end transform transition-transform duration-500 ${showNotifications ? 'translate-x-0' : 'translate-x-full'}`}>
           <NotificationPanel onClose={() => setShowNotifications(false)} />
        </div>
      </div>

      {showSignIn && <SignInModal onClose={() => setShowSignIn(false)} />}
    </>
  );
}