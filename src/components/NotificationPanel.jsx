import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Bell, Trash2 } from 'lucide-react';

// 🔥 System Notifications aur App Environment check (Android/iOS ke liye)
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👤 Current User email
  const userEmail = localStorage.getItem("eng_userEmail");

  // 🔥 DYNAMIC API URL LOGIC (Mobile ke liye seedha Render par jayega)
  const API_BASE = Capacitor.isNativePlatform() 
    ? "https://serdeptry1st.onrender.com" 
    : (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com");

  // 🔔 1. PERMISSION MANGNE WALA EFFECT
  useEffect(() => {
    const requestPermissions = async () => {
      if (Capacitor.isNativePlatform()) {
        const permStatus = await LocalNotifications.requestPermissions();
        if (permStatus.display !== 'granted') {
          console.warn('User denied notifications permission');
        }
      }
    };
    requestPermissions();
  }, []);

  // 🔄 2. Fetch Notifications & Show System Notification
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/notifications/latest?email=${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          setNotifications(data.notifications);

          // 🔥 ASLI ANDROID NOTIFICATION TRIGGER 🔥
          if (data.notifications.length > 0 && Capacitor.isNativePlatform()) {
            const latestSignal = data.notifications[0]; // Sabse naya wala signal
            
            await LocalNotifications.schedule({
              notifications: [
                {
                  title: latestSignal.title || "Intelligence Brief 📡",
                  body: `From @${latestSignal.userName}: "${latestSignal.word}"`,
                  id: new Date().getTime(), // Unique ID taaki purani se clash na ho
                  schedule: { at: new Date(Date.now() + 1000) }, // 1 second baad aayega
                  smallIcon: "ic_stat_icon_config_sample", // Android icon
                }
              ]
            });
          }
        }
      } catch (err) {
        console.error("Error fetching signals:", err);
        toast.error("Frequency Jammed! 📡");
      } finally {
        setLoading(false);
      }
    };
    if(userEmail) fetchNotifications();
  }, [userEmail, API_BASE]);

  // 🎯 Single Dismiss Logic
  const deleteSingle = async (e, id) => {
    e.stopPropagation(); 
    try {
      const res = await fetch(`${API_BASE}/api/notifications/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, postId: id })
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      toast.error("Failed to dismiss signal");
    }
  };

  // 🧹 Nuke All Logic
  const handleClearAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications/clear-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      if (res.ok) {
        setNotifications([]);
        toast.success("Signals Hub Cleared! 🧹");
      }
    } catch (err) {
      toast.error("System Override Failed");
    }
  };

  // 🚀 PROFESSIONAL NAVIGATION LOGIC UPDATE
  const handleSignalClick = (n) => {
    if (n && n.postId) {
      // Feed me scroll karne ke bajaye ab direct Single Post Page par jayega
      navigate(`/post/${n.postId}`);
      onClose(); // Panel band kar dega click hone ke baad
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end font-sans">
      {/* 🌑 Sleek Dark Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* 📱 Panel Container - Murrey Base (#F2EFE7) */}
      <div className="relative w-full max-w-[360px] bg-[#F2EFE7] h-full shadow-2xl flex flex-col animate-slide-in text-gray-900 border-l border-white/50">
        
        {/* 🛰️ Premium Solid Header - Alabaster (#8B004A) */}
        <div className="p-6 bg-[#8B004A] flex justify-between items-center shadow-md z-10 rounded-bl-3xl">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl text-[#F2EFE7]">
              <Bell size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-lg uppercase tracking-wider text-[#F2EFE7] leading-none">
                Signals Hub
              </h2>
              <span className="text-[10px] text-[#F2EFE7]/70 font-bold uppercase tracking-widest mt-1">
                Live Intelligence
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-[#F2EFE7]/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* 📡 List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-[#F2EFE7]">
          {loading ? (
            <div className="text-center py-12 text-[#8B004A]/60 font-bold text-xs uppercase animate-pulse tracking-widest">
              Scanning Frequencies...
            </div>
          ) : notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => handleSignalClick(n)} 
              className="relative p-5 bg-white rounded-2xl hover:shadow-lg transition-all cursor-pointer group shadow-sm border border-gray-100"
            >
              {/* ❌ Clean Dismiss Button */}
              <button 
                onClick={(e) => deleteSingle(e, n.id)}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all z-10"
              >
                <X size={14} strokeWidth={3} />
              </button>

              {/* 📡 Minimal Label */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-1.5 h-1.5 bg-[#8B004A] rounded-full"></div>
                <span className="text-[#8B004A]/70 font-bold text-[9px] uppercase tracking-widest">
                  New Signal
                </span>
              </div>
              
              {/* 📝 Content Section */}
              <div className="space-y-1.5 pr-6">
                <p className="text-gray-400 text-[11px] font-semibold tracking-wide">
                  From <span className="text-gray-700 font-bold">@{n.userName}</span>:
                </p>
                
                {/* 🆕 TITLE */}
                <h3 className="text-gray-900 font-black text-sm uppercase tracking-tight leading-snug group-hover:text-[#8B004A] transition-colors line-clamp-2">
                  {n.title || "Intelligence Brief"}
                </h3>

                {/* 🎯 WORD TAG */}
                <div className="inline-flex items-center gap-1.5 mt-2">
                   <span className="bg-[#8B004A]/10 text-[#8B004A] px-2.5 py-1 rounded-md font-black text-[10px] uppercase tracking-wider">
                     "{n.word}"
                   </span>
                </div>
              </div>

              {/* 🕒 Time-Ago Footer */}
              <div className="mt-4 flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  Captured
                </span>
                <span className="text-[9px] text-gray-500 font-bold">
                  {n.time}
                </span>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!loading && notifications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-50 mt-16">
              <Bell size={40} className="text-[#8B004A] mb-3 opacity-30" />
              <p className="text-[#8B004A] font-black text-[11px] uppercase tracking-[0.2em]">No Active Signals</p>
            </div>
          )}
        </div>

        {/* 🎮 Control Footer */}
        <div className="p-5 border-t border-gray-200 bg-white z-10">
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="w-full py-3.5 bg-white border border-gray-200 text-gray-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm flex justify-center items-center gap-2"
            >
              <Trash2 size={14} /> Clear All Signals
            </button>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
        .animate-slide-in { 
          animation: slide-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); 
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}