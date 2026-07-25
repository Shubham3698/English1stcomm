import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, PlusCircle, Users, X, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function SquadList() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("eng_userEmail") || "guest@gmail.com";
  const API_URL = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  const [squads, setSquads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Create Squad states
  const [showCreate, setShowCreate] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");

  // ✅ 1. FETCH SQUADS FROM UPDATED BACKEND
  const fetchSquads = useCallback(async () => {
    if (!userEmail) return;
    try {
      const res = await fetch(`${API_URL}/api/squads/user/${userEmail}`);
      const data = await res.json();
      if (data.success) {
        setSquads(data.squads);
      }
    } catch (err) {
      console.error("Failed to fetch squads:", err);
      toast.error("Failed to load squads");
    } finally {
      setLoading(false);
    }
  }, [userEmail, API_URL]);

  // Har baar jab ye page khulega (ya back aayenge), data refresh hoga aur badge gayab ho jayega
  useEffect(() => {
    fetchSquads();
    const interval = setInterval(() => fetchSquads(), 10000); // Har 10 sec me background refresh naye messages ke liye
    return () => clearInterval(interval);
  }, [fetchSquads]);

  // ✅ 2. CREATE SQUAD
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
        setShowCreate(false);
        setNewSquadName("");
        fetchSquads(); 
      }
    } catch (err) {
      toast.error("Failed to create squad");
    }
  };

  // ✅ 3. SEARCH FILTER
  const filteredSquads = squads.filter(sq => 
    sq.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#F2EFE7] w-full max-w-[450px] mx-auto relative shadow-2xl pb-[90px]">
      
      {/* 🚀 1. HEADER AREA */}
      <div className="bg-[#8B004A] text-white px-5 py-6 shadow-md rounded-b-[2rem] z-10 relative">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black tracking-wide">My Squads</h1>
          </div>
          
          <button 
            onClick={() => setShowCreate(!showCreate)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95"
          >
            {showCreate ? <X className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
          </button>
        </div>
        
        {/* 🔍 SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input 
            type="text" 
            placeholder="Search your squads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 text-white placeholder-white/60 rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:bg-white/20 transition-all border border-white/10"
          />
        </div>
      </div>

      {/* 🚀 2. CREATE SQUAD PANEL */}
      {showCreate && (
        <div className="animate-in slide-in-from-top-4 mx-4 mt-4 bg-white p-4 rounded-2xl shadow-sm border-[3px] border-[#8B004A]/10">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-3">Create New Squad</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Squad Name..." 
              value={newSquadName} 
              onChange={e => setNewSquadName(e.target.value)} 
              className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 text-sm font-bold outline-none focus:border-[#E01A76]" 
            />
            <button 
              onClick={handleCreateSquad} 
              className="bg-[#8B004A] text-white px-5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* 🚀 3. SQUADS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Loader2 className="w-10 h-10 text-[#8B004A] animate-spin mb-4" />
            <p className="font-bold text-gray-400">Loading your squads...</p>
          </div>
        ) : filteredSquads.length === 0 ? (
          <div className="text-center mt-24 flex flex-col items-center">
            <div className="bg-gray-200/50 p-5 rounded-full mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-black text-gray-700 text-lg">No Squads Found</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Click the + icon to create your first squad!</p>
          </div>
        ) : (
          filteredSquads.map((squad) => {
            
            // 🔥 BACKEND SE AANE WALA UNREAD COUNT 🔥
            const unreadCount = squad.unreadCount || 0; 
            
            return (
              <div 
                key={squad._id}
                onClick={() => navigate("/squad-chat", { state: { squad } })}
                className="bg-white p-4 rounded-2xl shadow-sm border-[2px] border-transparent hover:border-[#8B004A]/20 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all active:scale-95 group"
              >
                {/* Squad Avatar */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#8B004A]/20 to-[#8B004A]/5 text-[#8B004A] rounded-full flex items-center justify-center font-black text-2xl shrink-0 group-hover:scale-105 transition-transform relative">
                  {squad.name.charAt(0).toUpperCase()}
                  
                  {/* Agar unread message hai, avatar ke upar ek chhota dot dikhao optional */}
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#E01A76] border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                {/* Squad Details */}
                <div className="flex-1 overflow-hidden pr-2">
                  <h3 className={`text-base truncate ${unreadCount > 0 ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
                    {squad.name}
                  </h3>
                  <p className={`text-xs truncate flex items-center gap-1.5 uppercase tracking-wide mt-0.5 ${unreadCount > 0 ? "font-bold text-[#E01A76]" : "font-bold text-gray-400"}`}>
                    <Users className="w-3.5 h-3.5" /> 
                    {squad.members?.length || 0} Members
                  </p>
                </div>

                {/* 🔥 WHATSAPP STYLE UNREAD MESSAGE BADGE 🔥 */}
                {unreadCount > 0 && (
                  <div className="flex flex-col items-end justify-center">
                    <span className="bg-[#E01A76] text-white text-[11px] font-black min-w-[24px] h-[24px] px-1.5 flex items-center justify-center rounded-full shadow-md animate-in zoom-in duration-300">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}