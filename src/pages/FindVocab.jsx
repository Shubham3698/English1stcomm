import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard";
import PremiumSoundFeature from "../components/PremiumSoundFeature"; 

export default function FindVocab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary"); 

  const [activeIndex, setActiveIndex] = useState(null);
  const [isPremiumUser] = useState(localStorage.getItem("eng_isPremium") === "true");

  const postsSectionRef = useRef(null); 
  const userEmail = localStorage.getItem("eng_userEmail");
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  useEffect(() => {
    if (activeTab === "posts" && result?.relatedPosts?.length > 0) {
      setTimeout(() => {
        postsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [activeTab, result]);

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanWord = word.replace(/"/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = 'en-US'; 
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("AI Voice Offline! 🔊");
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return toast.error("INPUT WORD REQUIRED! ✍️");
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      
      if (data.success) {
        setResult(data);
        setActiveTab("dictionary"); 
      } else {
        toast.error("UNIT NOT FOUND IN DATABASE! 🧊");
      }
    } catch (err) {
      toast.error("NETWORK INTERRUPTED! 🌐");
    } finally {
      setLoading(false);
    }
  };

  const refreshPostsOnly = async () => {
    if (!query.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      if (data.success) setResult(data);
    } catch (err) { console.log("Refresh failed"); }
  };

  return (
    <div className="min-h-screen bg-[#08080a] p-4 font-sans max-w-[1200px] mx-auto pb-24 text-white">
      
      {/* Header Section: Aggressive Typography */}
      <div className="mt-10 mb-10 text-center lg:text-left lg:px-4">
        <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter leading-none text-white">
          VOCAB <span className="text-blue-600 drop-shadow-[0_0_15px_rgba(37,99,235,0.4)]">FINDER</span>
        </h1>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-3 italic opacity-80">
          Neural Dictionary & Community Database
        </p>
      </div>

      {/* Search Input Area: Matte & Glow */}
      <div className="max-w-[600px] lg:mx-4 mb-10">
        <form onSubmit={handleSearch} className="relative group mb-8">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ENTER SEARCH QUERY..." 
            className="w-full bg-[#121215] border-2 border-white/5 rounded-2xl py-5 pl-8 pr-20 text-md font-black uppercase italic text-white placeholder:text-gray-700 focus:border-blue-600 focus:ring-1 ring-blue-600/20 outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform group-hover:shadow-blue-500/20"
          >
            {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <span className="font-black italic">GO</span>}
          </button>
        </form>

        {/* TABS: Futuristic Switches */}
        {result && (
          <div className="flex items-center gap-3 p-1.5 bg-black/40 rounded-[1.5rem] border border-white/5 animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setActiveTab("dictionary")}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${
                activeTab === "dictionary" 
                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Lexicon Data
            </button>
            <button 
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all ${
                activeTab === "posts" 
                ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]" 
                : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Signals ({result.relatedPosts?.length || 0})
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="mt-4">
          
          {/* --- TAB 1: Dictionary View --- */}
          {activeTab === "dictionary" && (
            <div className="animate-in fade-in slide-in-from-left-6 duration-500 max-w-[600px] lg:mx-4">
              <div className="bg-[#0d0d0f] rounded-[2rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
                
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Header Row */}
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="bg-white/5 border border-white/10 text-blue-500 text-[10px] font-black uppercase px-4 py-1.5 rounded-lg tracking-[0.2em]">
                        {result.grammar || "LEXICON_UNIT"}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>
                  
                  <div className="ml-6">
                    <PremiumSoundFeature isPremiumUser={isPremiumUser}>
                      <button 
                        onClick={() => speakWord(result.word)}
                        className="w-12 h-12 bg-blue-600/10 border border-blue-600/30 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" />
                        </svg>
                      </button>
                    </PremiumSoundFeature>
                  </div>
                </div>

                {/* Word & Meaning: Massive Impact */}
                <div className="relative z-10 mb-8">
                  <h2 className="text-7xl font-[1000] text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-blue-500 transition-colors duration-500">
                    {result.word.replace(/"/g, '')}
                  </h2>
                  <div className="h-1 w-20 bg-blue-600 mb-6"></div>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent italic leading-tight">
                    {result.meaning.replace(/"/g, '')}
                  </p>
                </div>
                
                {/* Explanation Block */}
                <div className="p-6 bg-black/40 border-l-4 border-blue-600 rounded-r-2xl mb-8 relative z-10 shadow-inner">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Neural Interpretation</p>
                    <p className="text-[16px] font-bold text-gray-300 italic leading-relaxed">
                      {result.definition || "Consult community signals for full environmental context."}
                    </p>
                </div>

                {/* Usage Examples */}
                {result.exampleSentences && result.exampleSentences.length > 0 && (
                  <div className="space-y-4 pt-8 border-t border-white/5 relative z-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Operational Examples</p>
                    {result.exampleSentences.map((sent, idx) => (
                      <div key={idx} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group/sent">
                        <span className="text-blue-600 font-black text-lg italic">{idx + 1}.</span>
                        <p className="text-[15px] font-bold text-gray-200 italic leading-relaxed">"{sent}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB 2: Related Posts View --- */}
          {activeTab === "posts" && (
            <div 
              ref={postsSectionRef} 
              className="animate-in fade-in slide-in-from-right-6 duration-500 max-w-[480px] lg:mx-4"
            >
              <div className="flex items-center justify-between mb-8 px-4">
                <h3 className="text-2xl font-[1000] italic uppercase tracking-tighter text-white">
                  Related Signals 📡
                </h3>
                <div className="h-[1px] w-24 bg-purple-600/50"></div>
              </div>

              {result.relatedPosts && result.relatedPosts.length > 0 ? (
                <div className="space-y-6">
                  {result.relatedPosts.map((post) => (
                    <div key={post._id} className="transform transition-transform hover:scale-[1.01]">
                      <PostCard 
                        post={post}
                        userEmail={userEmail}
                        isPremiumUser={isPremiumUser}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        onRefresh={refreshPostsOnly} 
                        API_URL={API_URL}
                        highlightWord={result.word.replace(/"/g, '')} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                  <p className="text-[12px] font-black text-gray-600 uppercase tracking-[0.4em] italic px-10">
                    No signals detected for this unit 🧊
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