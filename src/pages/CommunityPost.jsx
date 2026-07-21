import React, { useState, useEffect, useCallback, useMemo } from "react";
import PostCard from "../components/PostCard"; 
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Loader2, Globe, Users, UserPlus, Plus, Send, Filter } from "lucide-react"; 
import toast from 'react-hot-toast'; 

export default function CommunityPost() {
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  // 🔥 UI TOGGLES
  const [showFilters, setShowFilters] = useState(false); // Controls the collapsible filter menu

  // 🔥 STATES FOR GROUPS / SQUADS
  const [activeView, setActiveView] = useState("community"); 
  const [squads, setSquads] = useState([]); 
  const [activeSquadId, setActiveSquadId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");

  const [showHeader, setShowHeader] = useState(true);
  const { scrollY } = useScroll();

  // 🚀 Header Animation Logic
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    const diff = latest - previous;
    if (diff > 10) {
        setShowHeader(false);
        setShowFilters(false); // Auto-hide filters on scroll down for cleaner UX
    } 
    else if (diff < -10) setShowHeader(true);
    if (latest < 20) setShowHeader(true);
  });

  const userEmail = localStorage.getItem("eng_userEmail");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true";
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // Fetch Community Posts
  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent && activeView === "community") setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/all`);
      const data = await res.json();
      setDbPosts(data);
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      if (!isSilent) setLoading(false); 
    }
  }, [API_URL, activeView]);

  // Fetch User's Squads (Mock)
  const fetchSquads = useCallback(async () => {
    setSquads([
      { _id: "g1", name: "IELTS Prep Squad", members: ["you@gmail.com", "rahul@gmail.com"] },
      { _id: "g2", name: "Daily Vocab Masters", members: ["you@gmail.com", "priya@gmail.com"] }
    ]);
    if (!activeSquadId) setActiveSquadId("g1");
  }, [userEmail, activeSquadId]);

  useEffect(() => {
    if (activeView === "community") {
      fetchPosts();
    } else {
      fetchSquads();
    }
    const interval = setInterval(() => fetchPosts(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchSquads, activeView]);

  // Filtering Community Posts
  const filteredPosts = useMemo(() => {
    if (!dbPosts || !Array.isArray(dbPosts)) return [];
    const currentUser = userEmail?.trim().toLowerCase();

    return dbPosts.filter((post) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        post.title?.toLowerCase().includes(query) || 
        post.word?.toLowerCase().includes(query) ||
        (Array.isArray(post.vocabData) && post.vocabData.some(v => v.word?.toLowerCase().includes(query)));
      
      if (!matchesSearch) return false;
      if (activeFilter === "all") return true;

      const isVoted = 
        (Array.isArray(post.votedBy) && post.votedBy.some(email => email.toLowerCase().trim() === currentUser)) ||
        (Array.isArray(post.vocabData) && post.vocabData.some(v => Array.isArray(v.votedBy) && v.votedBy.some(email => email.toLowerCase().trim() === currentUser)));

      const isLiked = Array.isArray(post.savedBy) && 
                      post.savedBy.some(email => email.toLowerCase().trim() === currentUser);

      switch (activeFilter) {
        case "voted": return isVoted;
        case "unvoted": return !isVoted;
        case "liked": return isLiked;
        default: return true;
      }
    });
  }, [dbPosts, searchQuery, activeFilter, userEmail]);

  const activeSquadPosts = useMemo(() => {
    const currentSquad = squads.find(s => s._id === activeSquadId);
    if(!currentSquad) return [];
    return dbPosts.filter(post => currentSquad.members.includes(post.userEmail));
  }, [dbPosts, activeSquadId, squads]);

  const handleCreateSquad = () => {
    if(!newSquadName) return toast.error("Enter squad name!");
    toast.success(`${newSquadName} created!`);
    setIsCreatingSquad(false);
    setNewSquadName("");
  };

  const handleAddMember = () => {
    if(!newMemberEmail) return toast.error("Enter an email!");
    toast.success(`${newMemberEmail} added to squad!`);
    setNewMemberEmail("");
  };

  return (
    <div className="flex justify-center bg-[#F2EFE7] min-h-screen font-sans overflow-x-hidden pb-24">
      <div className="w-full max-w-[450px] relative">
        
        {/* COMPACT ELITE HEADER */}
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }} 
          transition={{ type: "spring", stiffness: 140, damping: 20 }} 
          style={{ top: "64px" }} 
          className="fixed left-0 right-0 max-w-[450px] mx-auto z-[50] px-4 pt-3 pb-6 bg-gradient-to-b from-[#F2EFE7] via-[#F2EFE7]/90 to-transparent backdrop-blur-md pointer-events-none"
        >
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-[#8B004A]/5 border-[3px] border-[#8B004A]/10 p-3 space-y-3 pointer-events-auto transition-all duration-300">
            
            {/* 🔥 VIEW TOGGLE */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200">
              <button 
                onClick={() => setActiveView("community")}
                className={`flex-1 flex items-center justify-center py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeView === "community" ? "bg-white text-[#8B004A] shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Globe className="w-3.5 h-3.5 mr-1.5" /> Global
              </button>
              <button 
                onClick={() => setActiveView("squads")}
                className={`flex-1 flex items-center justify-center py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeView === "squads" ? "bg-white text-[#8B004A] shadow-sm border border-gray-200" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Users className="w-3.5 h-3.5 mr-1.5" /> My Squads
              </button>
            </div>

            {/* 🔥 NEW COMPACT SEARCH & FILTER BAR */}
            {activeView === "community" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative group flex-1">
                    <input 
                      type="text"
                      placeholder="Search hub..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F2EFE7] border-2 border-gray-200 rounded-xl py-2.5 px-10 text-sm font-bold tracking-wide outline-none focus:bg-white focus:border-[#E01A76] focus:shadow-[0_0_15px_rgba(224,26,118,0.1)] transition-all text-gray-900 placeholder-gray-400"
                    />
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8B004A] transition-transform group-focus-within:scale-110" />
                  </div>
                  
                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                      showFilters || activeFilter !== "all" 
                      ? "bg-[#8B004A] text-white border-[#8B004A] shadow-md" 
                      : "bg-[#F2EFE7] text-gray-400 border-gray-200 hover:text-[#8B004A]"
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {/* Collapsible Filter Chips */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pb-1">
                        {["all", "voted", "unvoted", "liked"].map((id) => (
                          <button
                            key={id}
                            onClick={() => setActiveFilter(id)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border-2
                              ${activeFilter === id 
                                ? "bg-[#8B004A] text-white border-[#8B004A] shadow-sm" 
                                : "bg-white text-gray-500 border-gray-100 hover:text-[#8B004A] hover:bg-[#8B004A]/5"}`}
                          >
                            {id}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SQUADS HEADER UI */}
            {activeView === "squads" && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
                <button onClick={() => setIsCreatingSquad(!isCreatingSquad)} className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-dashed border-[#8B004A]/40 text-[#8B004A] hover:bg-[#8B004A]/10 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
                {squads.map((squad) => (
                  <button
                    key={squad._id}
                    onClick={() => setActiveSquadId(squad._id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2
                      ${activeSquadId === squad._id 
                        ? "bg-[#8B004A] text-white border-[#8B004A] shadow-md" 
                        : "bg-white text-gray-500 border-gray-100 hover:text-[#8B004A]"}`}
                  >
                    {squad.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* LIST CONTENT - Adjusted Top Margin */}
        <div className="px-3 space-y-6 pt-[180px]"> 
          
          {/* COMMUNITY VIEW */}
          {activeView === "community" && !loading && filteredPosts.map((post) => (
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

          {/* SQUADS VIEW */}
          {activeView === "squads" && (
            <div className="animate-in fade-in duration-500">
              
              {/* Add Member / Create Squad Panel */}
              {isCreatingSquad ? (
                 <div className="bg-white p-4 rounded-[1.5rem] border-[3px] border-[#8B004A]/10 mb-6 shadow-sm">
                   <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">Create New Squad</h3>
                   <div className="flex gap-2">
                     <input type="text" placeholder="Squad Name..." value={newSquadName} onChange={e=>setNewSquadName(e.target.value)} className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 text-sm font-bold outline-none focus:border-[#E01A76]" />
                     <button onClick={handleCreateSquad} className="bg-[#8B004A] text-white px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">Create</button>
                   </div>
                 </div>
              ) : (
                squads.length > 0 && activeSquadId && (
                  <div className="bg-white p-4 rounded-[1.5rem] border-[3px] border-[#8B004A]/10 mb-6 shadow-sm flex items-center gap-3">
                    <UserPlus className="text-[#8B004A] w-6 h-6" />
                    <input 
                      type="email" 
                      placeholder="Add member by email..." 
                      value={newMemberEmail}
                      onChange={e=>setNewMemberEmail(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-gray-100 px-1 py-1 text-sm font-bold outline-none focus:border-[#E01A76] placeholder-gray-400" 
                    />
                    <button onClick={handleAddMember} className="bg-[#FFB800]/20 text-[#8B004A] p-2 rounded-lg hover:bg-[#FFB800]/40 transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}

              {/* Squad Posts Feed */}
              {squads.length > 0 && activeSquadPosts.map((post) => (
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

              {squads.length > 0 && activeSquadPosts.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <Users className="w-10 h-10 text-gray-300 mb-3" />
                  <span className="font-black uppercase tracking-[0.15em] text-xs text-gray-500">Squad is quiet</span>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">Share a post here to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Empty State (Community) */}
          {activeView === "community" && filteredPosts.length === 0 && !loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="bg-white border-[3px] border-gray-100 shadow-sm p-5 rounded-full mb-4">
                <Search className="w-8 h-8 text-[#8B004A] opacity-40" />
              </div>
              <span className="font-black uppercase tracking-[0.15em] text-xs text-gray-500">No Signals Found</span>
            </div>
          )}

          {/* Loading State */}
          {loading && activeView === "community" && (
             <div className="py-32 flex flex-col items-center justify-center text-center">
               <Loader2 className="w-10 h-10 text-[#E01A76] animate-spin mb-4" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}