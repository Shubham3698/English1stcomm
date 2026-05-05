import React, { useState } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard";

export default function FindVocab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary"); 

  const [activeIndex, setActiveIndex] = useState(null);
  const [isPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // 🔊 Function: AI English Pronunciation
  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = word.replace(/"/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US'; 
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Browser sound support nahi kar raha! 🔊");
    }
  };

  // ✅ 1. Main Search (Naye search ke liye)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return toast.error("Word toh dalo bhai! ✍️");
    
    setLoading(true);
    setResult(null); // Naya search fresh dikhane ke liye

    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        setActiveTab("dictionary"); 
      } else {
        toast.error("Word not found in DB! 🧊");
      }
    } catch (err) {
      toast.error("Network Error! 🌐");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 2. Silent Refresh (Post Card actions ke liye - No Reload)
  const refreshPostsOnly = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      if (data.success) {
        // Sirf result update hoga, loading ya null nahi hoga
        setResult(data);
      }
    } catch (err) {
      console.log("Silent refresh failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 font-sans max-w-[1200px] mx-auto pb-20">
      {/* Header Section */}
      <div className="mt-6 mb-8 lg:px-4 text-center lg:text-left">
        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-gray-900 leading-none">
          VOCAB <span className="text-red-600">FINDER</span>
        </h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">Search meanings & community hub</p>
      </div>

      {/* Search Input Area */}
      <div className="max-w-[500px] lg:mx-4 mb-6">
        <form onSubmit={handleSearch} className="relative group mb-6">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search word (e.g. pretend)..." 
            className="w-full bg-white border-2 border-gray-100 rounded-3xl py-4 pl-6 pr-16 text-sm font-bold focus:border-black outline-none transition-all shadow-sm"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-black text-white rounded-[1.2rem] flex items-center justify-center shadow-lg active:scale-90"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "GO"}
          </button>
        </form>

        {/* TABS */}
        {result && (
          <div className="flex items-center gap-3 px-1 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setActiveTab("dictionary")}
              className={`flex-1 py-3.5 rounded-2xl text-[11px] font-[1000] uppercase italic tracking-widest transition-all shadow-sm border-2 ${
                activeTab === "dictionary" 
                ? "bg-gray-100 border-gray-200 text-black translate-y-[-2px] shadow-md" 
                : "bg-white border-transparent text-gray-300"
              }`}
            >
              Dictionary
            </button>
            <button 
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3.5 rounded-2xl text-[11px] font-[1000] uppercase italic tracking-widest transition-all shadow-sm border-2 ${
                activeTab === "posts" 
                ? "bg-red-600 border-red-700 text-white translate-y-[-2px] shadow-lg shadow-red-200" 
                : "bg-white border-transparent text-gray-300"
              }`}
            >
              Posts ({result.relatedPosts?.length || 0})
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8">
          
          {/* --- TAB 1: Dictionary View --- */}
          {activeTab === "dictionary" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 max-w-[500px] lg:mx-4">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                
                {/* Grammar & Sound Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="bg-black text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest">
                        {result.grammar || "Vocabulary"}
                    </span>
                    <div className="h-[1px] flex-1 bg-gray-100"></div>
                  </div>
                  
                  {/* 🔊 SOUND BUTTON */}
                  <button 
                    onClick={() => speakWord(result.word)}
                    className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm active:scale-90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.563 6.625a.75.75 0 011.06 0 9 9 0 010 12.75.75.75 0 11-1.06-1.06 7.5 7.5 0 000-10.63.75.75 0 010-1.06zm-3.182 3.182a.75.75 0 011.061 0 4.5 4.5 0 010 6.364.75.75 0 01-1.06-1.06 3 3 0 000-4.242.75.75 0 010-1.062z" />
                    </svg>
                  </button>
                </div>

                {/* Word & Meaning */}
                <h2 className="text-5xl font-[1000] text-gray-900 uppercase italic tracking-tighter leading-none mb-3">
                  {result.word.replace(/"/g, '')}
                </h2>
                <p className="text-2xl font-black bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent italic mb-6">
                  {result.meaning.replace(/"/g, '')}
                </p>
                
                {/* Grammar & Explanation Block */}
                <div className="p-5 bg-gray-50 rounded-2xl border-l-4 border-black mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detailed Explanation</p>
                    <p className="text-[14px] font-bold text-gray-700 italic leading-snug">
                      {result.definition || "Community member has shared a post for this word. Check 'Posts' tab for full context."}
                    </p>
                </div>

                {/* Usage Examples */}
                {result.exampleSentences && result.exampleSentences.length > 0 && (
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Usage Examples</p>
                    {result.exampleSentences.map((sent, idx) => (
                      <div key={idx} className="flex gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                        <span className="text-red-500 font-black text-sm">{idx + 1}.</span>
                        <p className="text-[13px] font-bold text-gray-800 italic leading-relaxed">"{sent}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 2: Related Posts View --- */}
          {activeTab === "posts" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-[450px] lg:mx-4">
              <div className="flex items-center justify-between mb-6 px-4">
                <h3 className="text-xl font-[1000] italic uppercase tracking-tighter text-gray-900">
                  Related Posts 📱
                </h3>
                <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">
                  {result.relatedPosts?.length || 0} Results
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
                      // 🔥 FIX: refreshPostsOnly pass kiya taaki reload na ho
                      onRefresh={refreshPostsOnly} 
                      API_URL={API_URL}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/50 border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                  <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest italic leading-relaxed px-10">
                    Bhai is word se related koi post nahi hai! 🧊
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}