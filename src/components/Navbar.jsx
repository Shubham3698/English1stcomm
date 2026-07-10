import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import NotificationPanel from "./NotificationPanel";
import toast from "react-hot-toast";
import { Bell, Menu, X, User } from "lucide-react";

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
      <nav className="bg-[#0b101a]/95 text-white px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[100] border-b border-gray-800 shadow-lg backdrop-blur-md">
        
        {/* 🔴 BRAND LOGO */}
        <div className="flex flex-col cursor-pointer active:scale-95 transition-transform group" onClick={() => navigate("/")}>
          <h1 className="font-black text-xl md:text-2xl italic tracking-tighter leading-none text-white group-hover:text-gray-200 transition-colors">
            LEARN<span className="text-[#41ffd1]">-IGLISH</span>
          </h1>
          <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 italic mt-0.5">
            Serial Learners
          </span>
        </div>

        {/* 🔴 RIGHT CONTROLS */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* 🔔 NOTIFICATION BELL */}
          <div 
            onClick={() => {
              if (isLoggedIn) setShowNotifications(!showNotifications);
              else { setShowSignIn(true); toast.error("Sign in to check signals! 📡"); }
            }}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all active:scale-95 border
            ${isLoggedIn 
              ? (showNotifications ? 'border-[#41ffd1] bg-[#41ffd1]/10 text-[#41ffd1] shadow-[0_0_15px_rgba(65,255,209,0.2)]' : 'border-gray-700 bg-[#1a2538] text-gray-400 hover:text-white hover:border-gray-500') 
              : 'border-gray-800 bg-[#0b101a] text-gray-600 opacity-60'}`}
          >
            <Bell size={18} className={showNotifications ? "fill-[#41ffd1]/20" : ""} />
          </div>

          {/* 👤 USER PROFILE */}
          <div className="relative group">
            <div 
              onClick={() => isLoggedIn ? navigate("/user") : setShowSignIn(true)}
              className={`w-10 h-10 rounded-xl border overflow-hidden cursor-pointer active:scale-95 transition-all flex items-center justify-center relative bg-[#1a2538]
              ${isLoggedIn ? (isVIP ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'border-gray-600 hover:border-gray-400') : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}
            >
              {isLoggedIn ? (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("eng_userName") || 'learner'}`} 
                  alt="user" className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} />
              )}
            </div>
            {isLoggedIn && isVIP && (
              <div className="absolute -top-2 -right-2 z-10 pointer-events-none">
                <div className="bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded border border-yellow-300 shadow-sm">
                  PRO
                </div>
              </div>
            )}
          </div>

          {/* ☰ HAMBURGER */}
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="w-10 h-10 flex items-center justify-center bg-[#1a2538] border border-gray-700 text-gray-300 hover:text-white rounded-xl active:scale-95 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* 🌑 SIDEBAR OVERLAY */}
      <div 
        onClick={() => setIsMenuOpen(false)} 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] transition-opacity duration-500 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
      />

      {/* 📱 SIDEBAR */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#0b101a] border-l border-gray-800 z-[120] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* CLOSE BUTTON */}
        <div className="p-8 flex justify-end">
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white bg-[#1a2538] hover:bg-gray-800 rounded-xl transition-all active:scale-90 border border-gray-800"
            >
              <X size={20} />
            </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 px-8 space-y-6 mt-4 overflow-y-auto custom-scrollbar">
          {[
            { label: "Home Base", path: "/home" },
            { label: "Community", path: "/" },
            { label: "Neural Conquest", path: "/vocab-deck" },
            { label: "Word Scanner", path: "/find-vocab" },
            { label: "Saved Intel", onClick: () => goToPath("/saved-posts") },
            { label: "The Store", path: "/ebook-store" },
            { label: "Profile Hub", onClick: () => goToPath("/user") }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setIsMenuOpen(false);
              }}
              className="w-full text-left bg-transparent border-none p-0 transition-all duration-300 font-[900] text-gray-600 hover:text-[#41ffd1] hover:translate-x-2 uppercase text-2xl sm:text-3xl italic tracking-tighter active:scale-95 leading-none block"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* FOOTER SECTION */}
        <div className="p-8 space-y-5 border-t border-gray-800 bg-[#121c2d]/50">
            <button 
                onClick={() => { navigate("/upgrade"); setIsMenuOpen(false); }}
                className="text-yellow-500 font-bold uppercase text-[10px] tracking-[0.2em] hover:tracking-[0.3em] transition-all flex items-center gap-2"
            >
                Upgrade to Pro 💎
            </button>

            {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="text-red-400 font-bold uppercase text-[10px] tracking-[0.2em] hover:text-red-300 transition-colors w-full text-left"
                >
                    Terminate Session 🚪
                </button>
            ) : (
                <button 
                  onClick={() => { setIsMenuOpen(false); setShowSignIn(true); }} 
                  className="text-[#41ffd1] font-bold uppercase text-[10px] tracking-[0.2em] hover:text-white transition-colors w-full text-left"
                >
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