import React, { useState } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard"; // ✅ PostCard reuse kar rahe hain

export default function FindVocab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null); 
  const [isPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // 🔥 Search Handler
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return toast.error("Word toh dalo bhai! ✍️");
    setLoading(true);
    setResult(null);

    try {
      // Backend se word ka meaning + matching community posts mangwa rahe hain
      const res = await fetch(`${API_URL}/api/words/search-live?q=${query.trim()}`);
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
      } else {
        toast.error("Word not found!");
      }
    } catch (err) {
      toast.error("Network Error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans max-w-[450px] mx-auto pb-20">
      {/* Header */}
      <div className="mt-6 mb-8 text-center">
        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-gray-900 leading-none">
          VOCAB <span className="text-red-600">FINDER</span>
        </h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">Search & Discover</p>
      </div>
      
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative mb-8 group">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any word..." 
          className="w-full bg-white border-2 border-gray-100 rounded-3xl py-4 pl-6 pr-16 text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black text-white rounded-[1.2rem] flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "GO"}
        </button>
      </form>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* --- DICTIONARY RESULT CARD --- */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-black text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest">{result.grammar || "Word"}</span>
                <div className="h-[1px] flex-1 bg-gray-100"></div>
              </div>
              <h2 className="text-5xl font-[1000] text-gray-900 uppercase italic tracking-tighter leading-none mb-3">{result.word}</h2>
              <p className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic">{result.meaning}</p>
          </div>

          {/* --- 🔥 COMMUNITY POSTS MAPPING (Like Saved Vault) --- */}
          <div className="px-2">
            <div className="flex items-center justify-between mb-6 px-4">
              <h3 className="text-xl font-[1000] italic uppercase tracking-tighter text-gray-900">
                Related Posts 📱
              </h3>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {result.relatedPosts?.length || 0} Found
              </span>
            </div>

            {result.relatedPosts && result.relatedPosts.length > 0 ? (
              <div className="space-y-4">
                {result.relatedPosts.map((post) => (
                  <PostCard 
                    key={post._id}
                    post={post}
                    userEmail={userEmail}
                    isPremiumUser={isPremiumUser}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                    // ✅ CommentModal iske andar pehle se set hai as we discussed
                    onRefresh={handleSearch} 
                    API_URL={API_URL}
                  />
                ))}
              </div>
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-[2.5rem]">
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
                   Bhai is word se related koi post nahi mili! 🧊
                 </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}