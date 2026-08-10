import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard";
// 🔥 NAYA IMPORT: App environment check karne ke liye
import { Capacitor } from '@capacitor/core'; 

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  
  const userEmail = localStorage.getItem("eng_userEmail");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true";

  // 🔥 URL FIXING LOGIC (Same as VocabPage) 🔥
  const isApp = Capacitor.isNativePlatform();
  let API_URL = "https://serdeptry1st.onrender.com"; // Default to production for apps

  if (!isApp) {
    const currentHost = window.location.hostname;
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      API_URL = "http://localhost:3000"; 
    } else if (currentHost.startsWith("192.168.")) {
      API_URL = `http://${currentHost}:3000`; 
    }
  }

  // ✅ 1. Saved Posts Fetch Karne ka Logic
  const fetchSavedPosts = async () => {
    if (!userEmail) {
      setLoading(false);
      return toast.error("Pehle login karo bhai! 🔑");
    }

    try {
      // Backend route jo humne banaya tha: /api/english-posts/saved-posts
      const res = await fetch(`${API_URL}/api/english-posts/saved-posts?email=${userEmail}`);
      const data = await res.json();
      
      if (res.ok) {
        setPosts(data);
      } else {
        toast.error("Posts load nahi ho payi! 🧊");
      }
    } catch (err) {
      toast.error("Network issue! 🌐");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans max-w-[1200px] mx-auto pb-20">
      {/* --- Header Section --- */}
      <div className="mt-6 mb-10 lg:px-4 text-center lg:text-left">
        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-gray-900 leading-none">
          MY SAVED <span className="text-red-600">VAULT</span>
        </h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">
          Your personal vocabulary collection
        </p>
      </div>

      {/* --- Loading State --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening Vault...</p>
        </div>
      ) : (
        <div className="max-w-[500px] lg:mx-4">
          {posts.length > 0 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {posts.map((post) => (
                <PostCard 
                  key={post._id}
                  post={post}
                  userEmail={userEmail}
                  isPremiumUser={isPremiumUser}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                  // 🔥 Save/Unsave karne par list se hatane ke liye fetchSavedPosts call hoga
                  onRefresh={fetchSavedPosts} 
                  API_URL={API_URL}
                />
              ))}
            </div>
          ) : (
            /* --- Empty State --- */
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm px-10">
              <div className="text-5xl mb-6">📥</div>
              <h3 className="text-xl font-[1000] uppercase italic tracking-tighter text-gray-900 mb-2">
                Vault Khali Hai!
              </h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide leading-relaxed">
                Jo words pasand aayein unhe save karo, <br /> wo yahan dikhenge.
              </p>
              <button 
                onClick={() => window.location.href = "/community"}
                className="mt-8 bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                Explore Community
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}