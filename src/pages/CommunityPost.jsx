import React, { useState, useEffect, useCallback, useMemo } from "react";
import PostCard from "../components/PostCard"; 
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  const [showHeader, setShowHeader] = useState(true);
  const { scrollY } = useScroll();

  // 🚀 Header Animation Logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    const diff = latest - previous;
    if (diff > 10) setShowHeader(false); 
    else if (diff < -10) setShowHeader(true);
    if (latest < 20) setShowHeader(true);
  });

  const userEmail = localStorage.getItem("eng_userEmail");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true";
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      console.log("Fetched Data Sample:", data[0]); // Debugging ke liye
      setDbPosts(data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => fetchPosts(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPosts]);

// CommunityPost.jsx
const filteredPosts = useMemo(() => {
  if (!dbPosts || !Array.isArray(dbPosts)) return [];

  // 1. User email ko normalize karo taaki matching 100% accurate ho
  const currentUser = userEmail?.trim().toLowerCase();

  return dbPosts.filter((post) => {
    // --- SECTION 1: GLOBAL SEARCH (Title + Main Word) ---
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      post.title?.toLowerCase().includes(query) || 
      post.word?.toLowerCase().includes(query);
    
    if (!matchesSearch) return false;

    // --- SECTION 2: FILTER TAB LOGIC ---
    // Agar "all" selected hai toh aage check karne ki zaroorat nahi
    if (activeFilter === "all") return true;

    // 🔥 SINGLE SOURCE OF TRUTH: Sirf post level check
    // Backend Middleware ne ensure kiya hai ki card-level vote yahan sync hoga
    const isVoted = Array.isArray(post.votedBy) && 
                    post.votedBy.some(email => email.toLowerCase().trim() === currentUser);

    const isLiked = Array.isArray(post.savedBy) && 
                    post.savedBy.some(email => email.toLowerCase().trim() === currentUser);

    switch (activeFilter) {
      case "voted":
        return isVoted;
      case "unvoted":
        // Jo voted nahi hai, wahi unvoted hai
        return !isVoted;
      case "liked":
        return isLiked;
      default:
        return true;
    }
  });
}, [dbPosts, searchQuery, activeFilter, userEmail]);
  return (
    <div className="flex justify-center bg-white min-h-screen font-sans overflow-x-hidden">
      <div className="w-full max-w-[450px] relative">
        
        {/* COMPACT ELITE HEADER */}
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }} 
          transition={{ type: "spring", stiffness: 140, damping: 20 }} 
          style={{ top: "64px" }} 
          className="fixed left-0 right-0 max-w-[450px] mx-auto z-[50] px-4 pt-3 pb-6 bg-gradient-to-b from-white via-white/80 to-transparent backdrop-blur-[2px] pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 p-2.5 space-y-2 pointer-events-auto">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-2 px-9 text-[11px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-yellow-400/40 transition-all text-gray-600"
              />
              <svg className="absolute left-3 top-2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {["all", "voted", "unvoted", "liked"].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`flex-shrink-0 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95
                    ${activeFilter === id 
                      ? "bg-yellow-400 text-black shadow-sm" 
                      : "bg-gray-50 text-gray-400"}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LIST CONTENT */}
        <div className="mt-[150px] px-2 space-y-4"> 
          {!loading && filteredPosts.map((post) => (
            <PostCard 
              key={post._id}
              post={post}
              userEmail={userEmail}
              isPremiumUser={isPremiumUser}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onRefresh={() => fetchPosts(true)}
              API_URL={API_URL}
            />
          ))}

          {filteredPosts.length === 0 && !loading && (
            <div className="py-20 text-center opacity-20 font-black uppercase italic tracking-[0.2em] text-[10px]">
              No Signals Found 📡
            </div>
          )}

          {loading && (
             <div className="py-20 text-center animate-pulse font-black uppercase text-[10px] text-gray-300">
               Syncing Signals...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}