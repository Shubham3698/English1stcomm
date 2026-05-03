import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  // 👤 User click logic - English Community Specific
  const handleUserClick = () => {
    // ✅ FIX: Dameeto ki key ki jagah English app ki key check kar rahe hain
    const engEmail = localStorage.getItem("eng_userEmail");

    if (engEmail) {
      navigate("/user"); // ✅ Agar logged in hai toh profile page
    } else {
      setShowAuth(true); // ❌ Nahi toh login modal
    }
  };

  return (
    <>
      {/* 🔴 Top Navbar */}
 <nav className="bg-red-500 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md font-sans">
  
  {/* 🔴 Updated Logo Section */}
  <div 
    className="flex flex-col cursor-pointer active:scale-95 transition-transform"
    onClick={() => navigate("/")}
  >
    <h1 className="font-black text-xl italic tracking-tighter leading-none">
      LEARNING-LISH
    </h1>
    <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-70 leading-relaxed italic">
      Serial Learners
    </span>
  </div>

  {/* ☰ Hamburger */}
  <button
    onClick={() => setOpen(true)}
    className="text-2xl hover:scale-110 transition-transform"
  >
    ☰
  </button>
</nav>

      {/* 🔲 Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* 📱 Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ❌ Close Button */}
        <div className="flex justify-end p-5">
          <button 
            onClick={() => setOpen(false)} 
            className="text-gray-400 hover:text-black transition-colors"
          >
            <span className="text-xl font-bold">✕</span>
          </button>
        </div>

        {/* 👤 Sidebar Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="font-black text-gray-800 text-lg uppercase tracking-widest">Menu</h2>
        </div>

        {/* 📌 Navigation Links */}
        <div className="mt-4">
          <button
            onClick={() => {
              navigate("/");
              setOpen(false);
            }}
            className="w-full text-left px-6 py-4 hover:bg-gray-50 transition font-bold text-gray-600 flex items-center gap-3"
          >
            🏠 Home
          </button>

          <button
            onClick={() => {
              navigate("/community");
              setOpen(false);
            }}
            className="w-full text-left px-6 py-4 hover:bg-gray-50 transition font-bold text-gray-600 flex items-center gap-3"
          >
            📱 Community Post
          </button>

          <button
            onClick={() => {
              handleUserClick();
              setOpen(false);
            }}
            className="w-full text-left px-6 py-4 hover:bg-red-50 transition font-black text-red-500 flex items-center gap-3 border-t border-gray-50"
          >
            👤 My Profile
          </button>
        </div>

        {/* Logout Option (Optional: Sirf tab dikhega jab login ho) */}
        {localStorage.getItem("eng_userEmail") && (
            <div className="absolute bottom-10 w-full px-6">
                <button 
                    onClick={() => {
                        localStorage.removeItem("eng_userEmail");
                        localStorage.removeItem("eng_userName");
                        setOpen(false);
                        navigate("/");
                    }}
                    className="w-full py-3 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm uppercase"
                >
                    Quick Logout
                </button>
            </div>
        )}
      </div>

      {/* 🔐 Login/Signup Modal */}
      {showAuth && (
        <SignInModal onClose={() => setShowAuth(false)} />
      )}
    </>
  );
}