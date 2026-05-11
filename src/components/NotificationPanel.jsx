import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👤 Current User email
  const userEmail = localStorage.getItem("eng_userEmail");

  // 🔄 Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/notifications/latest?email=${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Error fetching signals:", err);
        toast.error("Frequency Jammed! 📡");
      } finally {
        setLoading(false);
      }
    };
    if(userEmail) fetchNotifications();
  }, [userEmail]);

  // 🎯 Single Dismiss Logic
  const deleteSingle = async (e, id) => {
    e.stopPropagation(); 
    try {
      const res = await fetch('http://localhost:3000/api/notifications/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, postId: id })
      });

      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("Signal Dismissed 🛸");
      }
    } catch (err) {
      toast.error("Failed to dismiss signal");
    }
  };

  // 🧹 Nuke All Logic
  const handleClearAll = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/notifications/clear-all', {
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

  const handleSignalClick = (n) => {
    if (n && n.postId && n.word) {
      const cleanWord = n.word.trim().replace(/"/g, '');
      navigate(`/?postId=${n.postId}&highlight=${encodeURIComponent(cleanWord)}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Panel */}
      <div className="relative w-full max-w-[350px] bg-[#0a0a0f] h-full border-l-2 border-white/10 shadow-2xl flex flex-col animate-slide-in font-sans text-white">
        
        {/* Header */}
        <div className="p-6 border-b-2 border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex flex-col">
            <h2 className="font-black text-[14px] uppercase tracking-widest italic leading-none">Signals Hub</h2>
            <span className="text-[8px] text-blue-500 font-bold uppercase tracking-tighter mt-1">Live Intelligence Feed</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-xl transition-colors">✕</button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {loading ? (
            <div className="text-center py-10 text-gray-500 font-black text-[10px] uppercase animate-pulse tracking-widest">Scanning Frequencies...</div>
          ) : notifications.map((n) => (
            <div 
              key={n.id} 
              onClick={() => handleSignalClick(n)} 
              className="relative p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-yellow-400/40 hover:bg-yellow-400/5 transition-all cursor-pointer group shadow-lg"
            >
              {/* ❌ Dismiss Button - Top Right (High UX) */}
              <button 
                onClick={(e) => deleteSingle(e, n.id)}
                className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500/40 hover:bg-red-500 hover:text-white transition-all z-10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* 📡 Header Label */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                <span className="text-yellow-400 font-black text-[9px] uppercase tracking-[0.2em] italic">New Signal</span>
              </div>
              
              {/* 📝 Content */}
              <div className="space-y-1">
                <p className="text-gray-400 text-[10px] font-bold tracking-tight">
                  <span className="text-white/80">@{n.userName}</span> shared:
                </p>
                <h3 className="text-white font-black text-xl italic tracking-tighter uppercase leading-tight group-hover:text-yellow-400 transition-colors">
                  "{n.word}"
                </h3>
              </div>

              {/* 🕒 Time-Ago - Bottom Right (Clean Separation) */}
              <div className="mt-4 flex justify-end border-t border-white/5 pt-2">
                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest leading-none">
                  Captured: {n.time}
                </span>
              </div>
            </div>
          ))}

          {!loading && notifications.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 mt-20">
              <span className="text-4xl mb-2 italic font-black">00</span>
              <p className="text-white font-black text-[9px] uppercase tracking-[0.3em]">No Active Signals</p>
            </div>
          )}
        </div>

        {/* Control Footer */}
        <div className="p-5 border-t-2 border-white/5 flex flex-col gap-3 bg-white/2">
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="w-full py-3 bg-red-600/10 border border-red-600/30 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-lg"
            >
              Nuke All Signals
            </button>
          )}
          <p className="text-[7px] text-center text-gray-600 font-black uppercase tracking-[0.4em]">Learn-Iglish Protocol v2.0</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}} />
    </div>
  );
}