import React, { useState, useEffect, useCallback, useMemo } from "react";
import PostCard from "../components/PostCard"; 
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Loader2 } from "lucide-react"; 

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
    // Background updated to Light theme matching VocabPage
    <div className="flex justify-center bg-[#F2EFE7] min-h-screen font-sans overflow-x-hidden pb-24">
      <div className="w-full max-w-[450px] relative">
        
        {/* COMPACT ELITE HEADER - Light Frosted Glass Effect */}
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }} 
          transition={{ type: "spring", stiffness: 140, damping: 20 }} 
          style={{ top: "64px" }} 
          className="fixed left-0 right-0 max-w-[450px] mx-auto z-[50] px-4 pt-3 pb-6 bg-gradient-to-b from-[#F2EFE7] via-[#F2EFE7]/90 to-transparent backdrop-blur-md pointer-events-none"
        >
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-[#8B004A]/5 border-[3px] border-[#8B004A]/10 p-3 space-y-3 pointer-events-auto">
            
            {/* Search Input */}
            <div className="relative group">
              <input 
                type="text"
                placeholder="Search community hub..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F2EFE7] border-2 border-gray-200 rounded-xl py-3 px-10 text-sm font-bold tracking-wide outline-none focus:bg-white focus:border-[#E01A76] focus:shadow-[0_0_15px_rgba(224,26,118,0.1)] transition-all text-gray-900 placeholder-gray-400"
              />
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8B004A] transition-transform group-focus-within:scale-110" />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {["all", "voted", "unvoted", "liked"].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border-2
                    ${activeFilter === id 
                      ? "bg-[#8B004A] text-white border-[#8B004A] shadow-md" 
                      : "bg-white text-gray-500 border-gray-100 hover:text-[#8B004A] hover:border-[#8B004A]/30 hover:bg-[#8B004A]/5"}`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LIST CONTENT */}
        <div className="mt-[170px] px-3 space-y-6"> 
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
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="bg-white border-[3px] border-gray-100 shadow-sm p-5 rounded-full mb-4">
                <Search className="w-8 h-8 text-[#8B004A] opacity-40" />
              </div>
              <span className="font-black uppercase tracking-[0.15em] text-xs text-gray-500">
                No Signals Found
              </span>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Try adjusting your filters</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
             <div className="py-32 flex flex-col items-center justify-center text-center">
               <Loader2 className="w-10 h-10 text-[#E01A76] animate-spin mb-4" />
               <span className="animate-pulse font-black uppercase tracking-[0.2em] text-xs text-[#8B004A]">
                 Syncing Signals...
               </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}