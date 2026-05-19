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
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // 🔄 Sync User State
  useEffect(() => {
    const checkUser = () => {
      const email = localStorage.getItem("eng_userEmail");
      const premium = localStorage.getItem("eng_isPremium") === "true";
      setIsLoggedIn(!!email);
      setIsPremiumUser(premium);
      setUserEmail(email || "");
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsPremiumUser(false);
    setUserEmail("");
    setIsMenuOpen(false);
    toast.success("Logged Out! 🚪");
    navigate("/");
  };

  const goToPath = (path) => {
    if (isLoggedIn) navigate(path);
    else {
      setShowSignIn(true);
      toast.error("Please Login First! 🛑");
    }
    setIsMenuOpen(false);
  };

  const isVIP = isPremiumUser || userEmail === "pandey0shubhm3698@gmail.com";

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
        <div className="flex items-center gap-3 md:gap-5">
          
          {/* 🔔 NOTIFICATION BELL */}
          <div 
            onClick={() => {
              if (isLoggedIn) setShowNotifications(!showNotifications);
              else { setShowSignIn(true); toast.error("Sign in to check signals! 📡"); }
            }}
            className={`relative w-11 h-11 flex items-center justify-center bg-white/5 border-2 rounded-xl cursor-pointer transition-all active:scale-90
            ${isLoggedIn ? (showNotifications ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-white/10 hover:border-yellow-400') : 'border-white/5 opacity-40'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={showNotifications ? "#facd15" : "none"} stroke="currentColor" strokeWidth="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>

          {/* 👤 USER PROFILE */}
          <div className="relative group">
            <div 
              onClick={() => isLoggedIn ? navigate("/user") : setShowSignIn(true)}
              className={`w-11 h-11 rounded-xl border-2 overflow-hidden cursor-pointer active:scale-90 transition-all flex items-center justify-center relative
              ${isLoggedIn ? (isVIP ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.25)]' : 'border-white/10') : 'border-white/10 bg-white/5 text-gray-500'}`}
            >
              {isLoggedIn ? (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("eng_userName") || 'learner'}`} 
                  alt="user" className="w-full h-full object-cover"
                />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            {isLoggedIn && isVIP && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-yellow-400 text-black text-[7px] font-[1000] px-1.5 py-0.5 rounded-md border-2 border-[#050507]">PRO</div>
              </div>
            )}
          </div>

          {/* ☰ HAMBURGER */}
          <button onClick={() => setIsMenuOpen(true)} className="w-11 h-11 flex items-center justify-center bg-white/5 border-2 border-white/10 rounded-xl active:scale-90 font-black text-xl">
            ☰
          </button>
        </div>
      </nav>

      {/* 🌑 SIDEBAR OVERLAY */}
      <div onClick={() => setIsMenuOpen(false)} className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[110] transition-opacity duration-500 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} />

      {/* 📱 SIDEBAR (Minimalist Text Only) */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#050507] z-[120] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* CLOSE BUTTON */}
        <div className="p-10 flex justify-end">
            <button onClick={() => setIsMenuOpen(false)} className="text-white text-3xl font-light hover:text-red-500 transition-colors active:scale-90 italic">✕</button>
        </div>

        {/* NAVIGATION LINKS (Text Only) */}
        <div className="flex-1 px-10 space-y-7 mt-4">
          {[
            { label: "Home Base", path: "/home", hover: "hover:text-white" },
            { label: "Community", path: "/", hover: "hover:text-orange-500" },
            { label: "Neural Conquest", path: "/vocab-deck", hover: "hover:text-blue-500" }, // 🔥 PATH FIXED
            { label: "Word Scanner", path: "/find-vocab", hover: "hover:text-indigo-400" },
            { label: "Saved Intel", onClick: () => goToPath("/saved-posts"), hover: "hover:text-emerald-400" },
            { label: "The Store", path: "/ebook-store", hover: "hover:text-pink-500" },
            { label: "Profile Hub", onClick: () => goToPath("/user"), hover: "hover:text-yellow-400" }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left bg-transparent border-none p-0 transition-all duration-300 font-[1000] 
                ${item.hover} text-white/30 uppercase text-3xl italic tracking-tighter active:scale-95 leading-none`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* FOOTER SECTION */}
        <div className="p-10 space-y-6">
            <button 
                onClick={() => { navigate("/upgrade"); setIsMenuOpen(false); }}
                className="text-yellow-400 font-black uppercase text-[10px] tracking-[0.3em] hover:tracking-[0.5em] transition-all flex items-center gap-2"
            >
                Upgrade to Pro 💎
            </button>

            {isLoggedIn ? (
                <button onClick={handleLogout} className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors">
                    Terminate Session 🚪
                </button>
            ) : (
                <button onClick={() => { setIsMenuOpen(false); setShowSignIn(true); }} className="text-white font-black uppercase text-[10px] tracking-[0.3em] hover:text-yellow-400 transition-colors">
                    Authorize Login 🔑
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