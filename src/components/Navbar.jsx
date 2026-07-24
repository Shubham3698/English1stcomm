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
      {/* 🔥 TOP NAVBAR: untouched as requested */}
      <nav className="bg-[#F2EFE7]/95 px-4 md:px-6 py-4 flex justify-between items-center sticky top-0 z-[100] border-b-2 border-[#8B004A]/10 shadow-lg shadow-[#8B004A]/5 backdrop-blur-md transition-colors duration-500">
        
        {/* 🔴 BRAND LOGO */}
        <div className="flex flex-col cursor-pointer active:scale-95 transition-transform group" onClick={() => navigate("/")}>
          <h1 className="font-black text-xl md:text-2xl italic tracking-tighter leading-none text-[#8B004A] group-hover:text-[#E01A76] transition-colors drop-shadow-sm">
            LEARN<span className="text-[#E01A76]">-IGLISH</span>
          </h1>
          <span className="text-[8px] md:text-[9px] font-extrabold uppercase tracking-[0.4em] text-gray-500 italic mt-0.5">
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
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all active:scale-95 border-2 shadow-sm
            ${isLoggedIn 
              ? (showNotifications ? 'border-[#8B004A] bg-[#8B004A]/10 text-[#8B004A] shadow-[0_0_15px_rgba(139,0,74,0.2)]' : 'border-gray-200 bg-white text-gray-500 hover:text-[#8B004A] hover:border-[#8B004A]') 
              : 'border-gray-200 bg-gray-100 text-gray-400 opacity-60'}`}
          >
            <Bell size={18} className={showNotifications ? "fill-[#8B004A]/20" : ""} />
          </div>

          {/* 👤 USER PROFILE */}
          <div className="relative group">
            <div 
              onClick={() => isLoggedIn ? navigate("/user") : setShowSignIn(true)}
              className={`w-10 h-10 rounded-xl border-2 overflow-hidden cursor-pointer active:scale-95 transition-all flex items-center justify-center relative bg-white shadow-sm
              ${isLoggedIn ? (isVIP ? 'border-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.4)]' : 'border-gray-200 hover:border-[#8B004A]') : 'border-gray-200 text-gray-400 hover:text-[#8B004A]'}`}
            >
              {isLoggedIn ? (
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${localStorage.getItem("eng_userName") || 'learner'}`} 
                  alt="user" className="w-full h-full object-cover bg-gray-50"
                />
              ) : (
                <User size={18} />
              )}
            </div>
            {isLoggedIn && isVIP && (
              <div className="absolute -top-2 -right-2 z-10 pointer-events-none">
                <div className="bg-[#FFB800] text-[#4A0027] text-[8px] font-black px-1.5 py-0.5 rounded border border-[#E6A600] shadow-md uppercase tracking-wider">
                  PRO
                </div>
              </div>
            )}
          </div>

          {/* ☰ HAMBURGER */}
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-200 text-gray-600 hover:text-[#8B004A] hover:border-[#8B004A] rounded-xl active:scale-95 transition-all shadow-sm"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* 🌑 SIDEBAR OVERLAY */}
      <div 
        onClick={() => setIsMenuOpen(false)} 
        className={`fixed inset-0 bg-[#4A0027]/40 backdrop-blur-sm z-[110] transition-opacity duration-500 ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} 
      />

      {/* 📱 SIDEBAR (Clean & Normal Style) */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#F2EFE7] border-l-[6px] border-[#8B004A] z-[120] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col shadow-2xl ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* CLOSE BUTTON */}
        <div className="p-6 flex justify-end">
            <button 
              onClick={() => setIsMenuOpen(false)} 
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-[#E01A76] hover:border-[#E01A76] bg-white rounded-xl transition-all active:scale-90 border-2 border-gray-200 shadow-sm"
            >
              <X size={20} />
            </button>
        </div>

        {/* NAVIGATION LINKS (Normal Text Style) */}
        <div className="flex-1 px-8 space-y-4 mt-2 overflow-y-auto custom-scrollbar">
          {[
            { label: "Home", path: "/home" },
            { label: "Community", path: "/" },
            { label: "Practice", path: "/vocab-deck" },
            { label: "Dictionary", path: "/find-vocab" },
            { label: "Saved Words", onClick: () => goToPath("/saved-posts") },
            { label: "Store", path: "/ebook-store" },
            { label: "Profile", onClick: () => goToPath("/user") }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.onClick) item.onClick();
                else navigate(item.path);
                setIsMenuOpen(false);
              }}
              className="w-full text-left bg-transparent border-none py-2 transition-all duration-300 font-bold text-gray-600 hover:text-[#8B004A] hover:translate-x-2 text-xl active:scale-95 block"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* FOOTER SECTION (Clean Buttons) */}
        <div className="p-6 space-y-3 border-t-2 border-[#8B004A]/10 bg-white/60">
            <button 
                onClick={() => { navigate("/upgrade"); setIsMenuOpen(false); }}
                className="w-full py-3 px-4 bg-[#FFB800] text-[#4A0027] font-black uppercase text-[12px] tracking-widest rounded-xl hover:bg-[#e6a600] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
                Upgrade to Pro 💎
            </button>

            {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-red-500 font-black uppercase text-[12px] tracking-widest rounded-xl hover:border-red-500 hover:bg-red-50 transition-colors text-center shadow-sm"
                >
                  Log Out 🚪
                </button>
            ) : (
                <button 
                  onClick={() => { setIsMenuOpen(false); setShowSignIn(true); }} 
                  className="w-full py-3 px-4 bg-[#E01A76] text-white font-black uppercase text-[12px] tracking-widest rounded-xl hover:bg-[#8B004A] transition-colors text-center shadow-sm"
                >
                  Sign In 🔑
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