import React, { useState, useRef, useEffect } from "react";
import toast from 'react-hot-toast';
import PostCard from "../components/PostCard";
import PremiumSoundFeature from "../components/PremiumSoundFeature"; 

export default function FindVocab() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dictionary"); 
  
  // 🔥 Translation States
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" : "https://serdeptry1st.onrender.com";

  // Nayi search par purana translation saaf karo
  useEffect(() => {
    setTranslatedText("");
  }, [result]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return toast.error("Word required! ✍️");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/search-live?q=${query.trim()}`);
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setActiveTab("dictionary"); 
      } else {
        toast.error("Not found! ❌");
      }
    } catch (err) {
      toast.error("Network Error!");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 On-Demand Translation Function
  const handleTranslate = async () => {
    if (!result?.definition) return;
    setIsTranslating(true);
    try {
      const res = await fetch(`${API_URL}/api/english-posts/auto-translate?text=${encodeURIComponent(result.definition)}`);
      const data = await res.json();
      if (data.success) {
        setTranslatedText(data.translated);
        toast.success("AI Translation Ready! ✨");
      } else {
        toast.error("Translation failed!");
      }
    } catch (err) {
      toast.error("Translation Server Error!");
    } finally {
      setIsTranslating(false);
    }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word.replace(/"/g, ''));
      utterance.lang = 'en-US'; utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans selection:bg-blue-500 pb-20">
      
      {/* 🔍 SEARCH HEADER */}
      <div className="sticky top-0 z-50 bg-[#050507]/80 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
          <input 
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#121217] border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-lg font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-600"
            placeholder="Search any word..."
          />
          <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-blue-600 px-5 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "GO"}
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* HERO WORD */}
            <div className="mb-12">
              <div className="flex flex-wrap items-end gap-4 mb-4">
                <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase leading-none">{result.word?.replace(/"/g, '')}</h1>
                <PremiumSoundFeature isPremiumUser={true} userEmail={localStorage.getItem("eng_userEmail")}>
                  <button onClick={() => speakWord(result.word)} className="w-14 h-14 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.5A2.25 2.25 0 002.25 9.75v4.5a2.25 2.25 0 002.25 2.25h1.94l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06z" /></svg>
                  </button>
                </PremiumSoundFeature>
              </div>
              <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-xl">
                <p className="text-2xl sm:text-3xl font-black uppercase">{result.meaning?.replace(/"/g, '') || "N/A"}</p>
              </div>
            </div>

            {/* TAB NAV */}
            <div className="flex gap-4 p-1.5 bg-[#121217] rounded-2xl w-fit mb-10 border border-white/5">
              <button onClick={() => setActiveTab("dictionary")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "dictionary" ? "bg-white text-black" : "text-gray-500"}`}>Definition</button>
              <button onClick={() => setActiveTab("posts")} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === "posts" ? "bg-white text-black" : "text-gray-500"}`}>Posts  ({result.relatedPosts?.length || 0})</button>
            </div>

            {/* CONTENT */}
            <div className="min-h-[300px]">
              {activeTab === "dictionary" && (
                <div className="space-y-10">
                  <div className="bg-[#121217] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-600 transition-all group-hover:w-3"></div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-blue-500 tracking-[0.3em] uppercase block">Analysis // {result.grammar || "LEXICON"}</span>
                      
                      {/* 🔥 Translation Trigger Button */}
                      {!translatedText && (
                        <button 
                          onClick={handleTranslate} 
                          disabled={isTranslating}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                          {isTranslating ? "Processing..." : "Translate to Hindi 🇮🇳"}
                        </button>
                      )}
                    </div>

                    <p className="text-2xl sm:text-3xl font-bold text-gray-200 leading-tight mb-6">
                      {result.definition || "No context mapped."}
                    </p>

                    {/* 🔥 Fading in Translated Text */}
                    {translatedText && (
                      <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                        <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest block mb-2">Hindi Explanation:</span>
                        <p className="text-xl sm:text-2xl font-bold text-gray-400 italic">
                          {translatedText}
                        </p>
                      </div>
                    )}
                  </div>

                  {result.exampleSentences?.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-gray-600 uppercase tracking-widest px-2">Example Usage</h3>
                      {result.exampleSentences.map((s, i) => (
                        <div key={i} className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 flex gap-5 hover:bg-white/[0.04] transition-all">
                          <span className="text-blue-500 font-black text-lg">0{i+1}</span>
                          <p className="text-lg text-gray-400 italic">"{s}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "posts" && (
                <div className="grid sm:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4">
                  {result.relatedPosts?.map((post) => (
                    <PostCard key={post._id} post={post} userEmail={localStorage.getItem("eng_userEmail")} highlightWord={result.word} isPremiumUser={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}