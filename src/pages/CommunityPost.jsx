import React, { useState, useEffect, useCallback, useMemo } from "react";
import PostCard from "../components/PostCard"; 
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Loader2 } from "lucide-react"; // Icons for premium look

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

  const filteredPosts = useMemo(() => {
    if (!dbPosts || !Array.isArray(dbPosts)) return [];

    const currentUser = userEmail?.trim().toLowerCase();

    return dbPosts.filter((post) => {
      // --- SECTION 1: GLOBAL SEARCH ---
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        post.title?.toLowerCase().includes(query) || 
        post.word?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;

      // --- SECTION 2: FILTER TAB LOGIC ---
      if (activeFilter === "all") return true;

      const isVoted = Array.isArray(post.votedBy) && 
                      post.votedBy.some(email => email.toLowerCase().trim() === currentUser);

      const isLiked = Array.isArray(post.savedBy) && 
                      post.savedBy.some(email => email.toLowerCase().trim() === currentUser);

      switch (activeFilter) {
        case "voted":
          return isVoted;
        case "unvoted":
          return !isVoted;
        case "liked":
          return isLiked;
        default:
          return true;
      }
    });
  }, [dbPosts, searchQuery, activeFilter, userEmail]);

  return (
    // Background updated to dark navy theme
    <div className="flex justify-center bg-[#0b101a] min-h-screen font-sans overflow-x-hidden pb-24">
      <div className="w-full max-w-[450px] relative">
        
        {/* COMPACT ELITE HEADER - Dark Frosted Glass Effect */}
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }} 
          transition={{ type: "spring", stiffness: 140, damping: 20 }} 
          style={{ top: "64px" }} 
          className="fixed left-0 right-0 max-w-[450px] mx-auto z-[50] px-4 pt-3 pb-6 bg-gradient-to-b from-[#0b101a] via-[#0b101a]/90 to-transparent backdrop-blur-md pointer-events-none"
        >
          <div className="bg-[#121c2d] rounded-2xl shadow-xl border border-blue-900/40 p-3 space-y-3 pointer-events-auto">
            
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Search community hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0b101a] border border-gray-800 rounded-xl py-2.5 px-10 text-xs font-bold tracking-wide outline-none focus:border-[#41ffd1]/50 focus:ring-1 focus:ring-[#41ffd1]/20 transition-all text-white placeholder-gray-500"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {["all", "voted", "unvoted", "liked"].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95
                    ${activeFilter === id 
                      ? "bg-[#41ffd1] text-black shadow-[0_0_10px_rgba(65,255,209,0.2)]" 
                      : "bg-[#1a2538] text-gray-400 border border-gray-800 hover:text-gray-200"}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LIST CONTENT */}
        <div className="mt-[160px] px-3 space-y-4"> 
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

          {/* Empty State */}
          {filteredPosts.length === 0 && !loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-40">
              <div className="bg-gray-800/50 p-4 rounded-full mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <span className="font-black uppercase tracking-[0.15em] text-xs text-gray-300">
                No Signals Found
              </span>
              <p className="text-[10px] text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
             <div className="py-24 flex flex-col items-center justify-center text-center">
               <Loader2 className="w-8 h-8 text-[#41ffd1] animate-spin mb-3 opacity-80" />
               <span className="animate-pulse font-black uppercase tracking-widest text-xs text-gray-400">
                 Syncing Signals...
               </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}