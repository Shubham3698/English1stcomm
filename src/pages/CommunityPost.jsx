import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import PostCard from "../components/PostCard"; 
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Loader2, Globe, Users, UserPlus, Plus, Send, Filter, X, Check, ChevronDown, MessageCircle } from "lucide-react"; 
import toast from 'react-hot-toast'; 

export default function CommunityPost() {
  const navigate = useNavigate(); 
  
  const [dbPosts, setDbPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  // 🔥 UI TOGGLES
  const [showFilterSheet, setShowFilterSheet] = useState(false); 
  
  // 🔥 MASTER SCROLL STATE
  const [uiState, setUiState] = useState("expanded");

  // 🔥 STATES FOR GROUPS / SQUADS
  const [activeView, setActiveView] = useState("community"); 
  const [squads, setSquads] = useState([]); 
  const [activeSquadId, setActiveSquadId] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");

  const { scrollY } = useScroll();

  // 🚀 Scroll Engine
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    const diff = latest - previous;
    
    if (latest < 20) {
        setUiState("expanded");
        return;
    }
    if (diff > 10 && uiState !== "hidden") {
        setUiState("hidden"); 
    } 
    else if (diff < -10 && uiState === "hidden") {
        setUiState("peek");
    }
  });

  const userEmail = localStorage.getItem("eng_userEmail");
  const isPremiumUser = localStorage.getItem("eng_isPremium") === "true";
  
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // ==========================================
  // API CALLS & LOGIC
  // ==========================================

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

  // ✅ 1. REAL API SE SQUADS FETCH KARNA
  const fetchSquads = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
      const data = await res.json();
      if (data.success) {
        setSquads(data.squads);
        if (data.squads.length > 0 && !activeSquadId) {
          setActiveSquadId(data.squads[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch squads:", err);
    }
  }, [userEmail, activeSquadId, API_URL]);

  useEffect(() => {
    if (activeView === "community") fetchPosts();
    else fetchSquads();
    const interval = setInterval(() => fetchPosts(true), 30000);
    return () => clearInterval(interval);
  }, [fetchPosts, fetchSquads, activeView]);

  // ✅ 2. REAL SQUAD CREATE KARNA
  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) return toast.error("Enter a squad name!");
    try {
      const res = await fetch(`${API_URL}/api/squads/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSquadName, email: userEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Squad '${newSquadName}' created!`);
        setIsCreatingSquad(false);
        setNewSquadName("");
        fetchSquads(); // Refresh list
      }
    } catch (err) {
      toast.error("Failed to create squad");
    }
  };

  // ✅ 3. SQUAD ME MEMBER ADD KARNA
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return toast.error("Enter an email!");
    if (!activeSquadId) return toast.error("Select a squad first!");
    
    try {
      const res = await fetch(`${API_URL}/api/squads/${activeSquadId}/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newMemberEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${newMemberEmail} added to squad!`);
        setNewMemberEmail("");
        fetchSquads(); // Refresh list to get updated members
      }
    } catch (err) {
      toast.error("Failed to add member");
    }
  };

  // ✅ 4. SQUAD FEED FILTER LOGIC (Member post karega toh group mein dikhega)
  const activeSquadPosts = useMemo(() => {
    if (!activeSquadId || squads.length === 0 || !dbPosts) return [];
    
    const activeSquad = squads.find((s) => s._id === activeSquadId);
    if (!activeSquad) return [];
    
    const memberEmails = activeSquad.members.map(e => e.toLowerCase().trim());

    return dbPosts.filter(post => {
      // Handle different possible key names for author email from your DB
      const postAuthor = (post.userEmail || post.email || post.createdBy || "").toLowerCase().trim();
      return memberEmails.includes(postAuthor);
    });
  }, [activeSquadId, squads, dbPosts]);

const filteredPosts = useMemo(() => {
    if (!dbPosts || !Array.isArray(dbPosts)) return [];
    
    // currentUser setup safely
    const currentUser = userEmail ? userEmail.trim().toLowerCase() : "";

    return dbPosts.filter((post) => {
      
      // 🔥 1. SEARCH LOGIC
      const query = searchQuery ? searchQuery.toLowerCase().trim() : "";
      const matchesSearch = 
        query === "" || 
        post.title?.toLowerCase().includes(query) || 
        post.word?.toLowerCase().includes(query) ||
        (Array.isArray(post.vocabData) && post.vocabData.some(v => v.word?.toLowerCase().includes(query)));
      
      if (!matchesSearch) return false;
      if (activeFilter === "all") return true;

      // 🔥 2. CHECK STATS (Easy/Hard/DailyUse) -> ACTUAL "VOTED"
      // Helper function to check if user exists in the stats array
      const hasGivenStat = (stats) => {
        return Array.isArray(stats) && stats.some(stat => stat?.email?.toLowerCase().trim() === currentUser);
      };

      const isVoted = 
        hasGivenStat(post.userStats) || 
        (Array.isArray(post.vocabData) && post.vocabData.some(v => hasGivenStat(v.wordStats)));

      // 🔥 3. CHECK LIKES (Hearts) & SAVES (Bookmarks) -> "LIKED / SAVED"
      const isLiked = 
        (Array.isArray(post.savedBy) && post.savedBy.some(email => email?.toLowerCase().trim() === currentUser)) ||
        (Array.isArray(post.votedBy) && post.votedBy.some(email => email?.toLowerCase().trim() === currentUser)) ||
        (Array.isArray(post.vocabData) && post.vocabData.some(v => Array.isArray(v.votedBy) && v.votedBy.some(email => email?.toLowerCase().trim() === currentUser)));

      // 🔥 4. APPLY EXACT FILTER
      switch (activeFilter) {
        case "voted": return isVoted;      // Sirf easy/hard wale
        case "unvoted": return !isVoted;   // Jisme stat update nahi kiya
        case "liked": return isLiked;      // Hearts ya saved wale
        default: return true;
      }
    });
  }, [dbPosts, searchQuery, activeFilter, userEmail]);
  
  const handleApplyFilter = (filterId) => {
    setActiveFilter(filterId);
    setShowFilterSheet(false);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex justify-center bg-[#F2EFE7] min-h-screen font-sans overflow-x-hidden pb-24 relative">
      <div className="w-full max-w-[450px] relative">
        
        {/* 🔥 THE "ATAK GAYA" PEEK TAB */}
        <motion.button
          className="fixed top-[64px] left-1/2 -translate-x-1/2 z-[60] bg-white border-b-[3px] border-x-[3px] border-[#8B004A]/20 px-8 py-1 rounded-b-[1rem] shadow-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-95"
          initial={{ y: -50 }}
          animate={{ y: uiState === "peek" ? 4 : -50 }}
          transition={{ type: "spring", stiffness: 600, damping: 12 }} 
          onClick={() => setUiState("expanded")}
        >
          <div className="w-6 h-1 bg-gray-200 rounded-full mb-0.5"></div>
          <ChevronDown className="w-4 h-4 text-[#8B004A]" />
        </motion.button>

        {/* 🔥 MAIN HEADER 🔥 */}
        <motion.div 
          initial={{ y: 0, opacity: 1 }}
          animate={{ 
            y: uiState === "expanded" ? 0 : -200, 
            opacity: uiState === "expanded" ? 1 : 0 
          }} 
          transition={{ type: "spring", stiffness: 180, damping: 22 }} 
          style={{ top: "64px" }} 
          className="fixed left-0 right-0 max-w-[450px] mx-auto z-[50] px-4 pt-3 pb-6 bg-gradient-to-b from-[#F2EFE7] via-[#F2EFE7]/90 to-transparent backdrop-blur-md pointer-events-none"
        >
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-[#8B004A]/5 border-[3px] border-[#8B004A]/10 p-3 space-y-3 pointer-events-auto">
            
            {/* VIEW TOGGLE */}
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

            {/* SEARCH & FILTER BUTTON */}
            {activeView === "community" && (
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
                
                <button
                  onClick={() => setShowFilterSheet(true)}
                  className={`relative flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl border-2 transition-all duration-300 active:scale-95 ${
                    activeFilter !== "all" 
                    ? "bg-[#8B004A] text-white border-[#8B004A] shadow-md" 
                    : "bg-[#F2EFE7] text-gray-500 border-gray-200 hover:text-[#8B004A] hover:border-[#8B004A]/30"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {activeFilter !== "all" && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>
              </div>
            )}

            {/* SQUADS HEADER UI */}
            {activeView === "squads" && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
                <button onClick={() => setIsCreatingSquad(!isCreatingSquad)} className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full border-2 border-dashed border-[#8B004A]/40 text-[#8B004A] hover:bg-[#8B004A]/10 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
                {squads.map((squad) => (
                  <div key={squad._id} className="flex-shrink-0 flex items-center bg-white border-2 border-gray-100 rounded-xl p-0.5 shadow-sm transition-all">
                    <button
                      onClick={() => setActiveSquadId(squad._id)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                        activeSquadId === squad._id 
                        ? "bg-[#8B004A] text-white" 
                        : "text-gray-500 hover:text-[#8B004A]"
                      }`}
                    >
                      {squad.name}
                    </button>

                    {/* 🚀 CHAT PE JANE WALA BUTTON 🚀 */}
                    <button
                      onClick={() => navigate('/squad-chat', { state: { squad } })}
                      className="p-2 mx-0.5 rounded-lg bg-[#8B004A]/10 text-[#8B004A] hover:bg-[#8B004A] hover:text-white transition-all group"
                      title="Open Chat"
                    >
                      <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* LIST CONTENT */}
        <div className="px-3 space-y-6 pt-[165px]"> 
          {activeView === "community" && !loading && filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} userEmail={userEmail} isPremiumUser={isPremiumUser} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onRefresh={() => fetchPosts(true)} API_URL={API_URL} />
          ))}

          {activeView === "squads" && (
            <div className="animate-in fade-in duration-500">
              {isCreatingSquad ? (
                 <div className="bg-white p-4 rounded-[1.5rem] border-[3px] border-[#8B004A]/10 mb-6 shadow-sm">
                   <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">Create New Squad</h3>
                   <div className="flex gap-2">
                     <input type="text" placeholder="Squad Name..." value={newSquadName} onChange={e=>setNewSquadName(e.target.value)} className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 text-sm font-bold outline-none focus:border-[#E01A76]" />
                     
                     {/* ✅ FIXED BUTTON: handleCreateSquad call hogi yahan */}
                     <button onClick={handleCreateSquad} className="bg-[#8B004A] text-white px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">Create</button>
                   </div>
                 </div>
              ) : (
                squads.length > 0 && activeSquadId && (
                  <div className="bg-white p-4 rounded-[1.5rem] border-[3px] border-[#8B004A]/10 mb-6 shadow-sm flex items-center gap-3">
                    <UserPlus className="text-[#8B004A] w-6 h-6" />
                    <input type="email" placeholder="Add member by email..." value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} className="flex-1 bg-transparent border-b-2 border-gray-100 px-1 py-1 text-sm font-bold outline-none focus:border-[#E01A76] placeholder-gray-400" />
                    
                    {/* ✅ FIXED BUTTON: handleAddMember call hogi yahan */}
                    <button onClick={handleAddMember} className="bg-[#FFB800]/20 text-[#8B004A] p-2 rounded-lg hover:bg-[#FFB800]/40 transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
              {squads.length > 0 && activeSquadPosts?.map((post) => (
                <PostCard key={post._id} post={post} userEmail={userEmail} isPremiumUser={isPremiumUser} activeIndex={activeIndex} setActiveIndex={setActiveIndex} onRefresh={() => fetchPosts(true)} API_URL={API_URL} />
              ))}
            </div>
          )}

          {activeView === "community" && filteredPosts.length === 0 && !loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="bg-white border-[3px] border-gray-100 shadow-sm p-5 rounded-full mb-4">
                <Search className="w-8 h-8 text-[#8B004A] opacity-40" />
              </div>
              <span className="font-black uppercase tracking-[0.15em] text-xs text-gray-500">No Signals Found</span>
            </div>
          )}

          {loading && activeView === "community" && (
             <div className="py-32 flex flex-col items-center justify-center text-center">
               <Loader2 className="w-10 h-10 text-[#E01A76] animate-spin mb-4" />
             </div>
          )}
        </div>

        {/* BOTTOM SHEET FOR FILTERS */}
        <AnimatePresence>
          {showFilterSheet && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilterSheet(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] cursor-pointer"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 max-w-[450px] mx-auto bg-white rounded-t-[2rem] shadow-2xl z-[101] border-t-2 border-gray-100 pb-8"
              >
                <div className="w-full flex justify-center py-4">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>
                <div className="px-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-gray-900">Filter Posts</h2>
                    <button onClick={() => setShowFilterSheet(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-transform">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: "all", label: "All Posts", desc: "View everything in the hub" },
                      { id: "voted", label: "Voted by Me", desc: "Posts you have participated in" },
                      { id: "unvoted", label: "Not Voted", desc: "Fresh posts awaiting your vote" },
                      { id: "liked", label: "Saved / Liked", desc: "Your bookmarked favorites" }
                    ].map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => handleApplyFilter(filter.id)}
                        className={`flex items-center justify-between w-full p-4 rounded-2xl border-2 transition-all duration-300 active:scale-95 ${
                          activeFilter === filter.id 
                          ? "bg-[#8B004A]/5 border-[#8B004A] text-[#8B004A]" 
                          : "bg-white border-gray-100 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex flex-col items-start text-left">
                          <span className="font-bold text-sm">{filter.label}</span>
                          <span className="text-[11px] font-medium text-gray-400 mt-0.5">{filter.desc}</span>
                        </div>
                        {activeFilter === filter.id && (
                          <div className="bg-[#8B004A] text-white p-1 rounded-full shadow-sm">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}