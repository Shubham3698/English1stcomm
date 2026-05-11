import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard";
import PremiumSoundFeature from "../components/PremiumSoundFeature"; 

export default function FindVocab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary"); 
  const [showHindi, setShowHindi] = useState(false);
  const [hindiDefinition, setHindiDefinition] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const postsSectionRef = useRef(null); 
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // Data reset on new search
  useEffect(() => {
    setShowHindi(false);
    setHindiDefinition("");
  }, [result]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return toast.error("Word required!");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setActiveTab("dictionary"); 
      } else {
        toast.error("Not found in database");
      }
    } catch (err) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.replace(/"/g, ''));
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] p-6 sm:p-12 text-white font-sans selection:bg-yellow-500">
      
      {/* --- SEARCH BAR --- */}
      <div className="max-w-xl mb-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#121215] border-b-2 border-white/10 py-4 px-2 text-2xl font-bold uppercase italic outline-none focus:border-blue-600 transition-all"
            placeholder="SCAN_WORD..."
          />
          <button type="submit" disabled={loading} className="bg-blue-600 px-8 font-black italic uppercase hover:bg-blue-500">
            {loading ? "..." : "GO"}
          </button>
        </form>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
          
          {/* --- WORD & HINDI MEANING (IMAGE STYLE) --- */}
          <div className="mb-16">
            <div className="flex items-center gap-8 mb-2">
              <h2 
                className="text-7xl sm:text-[12rem] font-[1000] uppercase italic leading-none tracking-tighter"
                style={{ textShadow: "4px 4px 0px #ff0000, -3px -3px 0px #00ffff" }}
              >
                {result.word ? result.word.replace(/"/g, '') : "LOADING"}
              </h2>
              
              <button onClick={() => speakWord(result.word)} className="p-4 bg-white/5 border border-white/10 hover:bg-blue-600 transition-all">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
              </button>
            </div>

            {/* The Specific Yellow Underline from Image */}
            <div className="h-2 w-40 bg-[#facc15] mb-8"></div>

            {/* ACTUAL HINDI MEANING FROM BACKEND */}
            <p className="text-5xl sm:text-7xl font-black text-gray-500 uppercase italic tracking-tighter">
              {result.meaning ? result.meaning.replace(/"/g, '') : "N/A"}
            </p>
          </div>

          {/* --- TABS --- */}
          <div className="flex gap-8 border-b border-white/5 mb-8 pb-2">
            <button onClick={() => setActiveTab("dictionary")} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "dictionary" ? "text-blue-500" : "text-gray-600"}`}>[ 01_DEFINITION ]</button>
            <button onClick={() => setActiveTab("posts")} className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "posts" ? "text-purple-500" : "text-gray-600"}`}>[ 02_SIGNALS ({result.relatedPosts?.length}) ]</button>
          </div>

          {/* --- CONTENT --- */}
          {activeTab === "dictionary" && (
            <div className="max-w-3xl space-y-8 bg-[#111114] p-8 border border-white/5 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <p className="text-[10px] font-black text-blue-500 tracking-[0.4em] mb-4">NEURAL_DATA_LOG // {result.grammar || "LEXICON"}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-300 italic leading-relaxed">
                {result.definition || "No further environmental context mapped."}
              </p>

              {result.exampleSentences?.length > 0 && (
                <div className="pt-8 border-t border-white/5 space-y-4">
                  <p className="text-[10px] font-black text-gray-700 tracking-widest uppercase">Examples:</p>
                  {result.exampleSentences.map((s, i) => (
                    <div key={i} className="flex gap-4 italic text-gray-400">
                      <span className="text-blue-600 font-black">0{i+1}</span>
                      <p>"{s}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="grid sm:grid-cols-2 gap-6 animate-in slide-in-from-right-5">
              {result.relatedPosts?.map((post) => (
                <PostCard key={post._id} post={post} userEmail={localStorage.getItem("eng_userEmail")} highlightWord={result.word} />
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}