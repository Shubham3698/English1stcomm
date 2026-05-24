import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VocabPage() {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [sentences, setSentences] = useState("");
  const [activeWord, setActiveWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false); // Dropdown toggle state

  const USER_ID = "dameeto_user_shubham_123"; 

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://serdeptry1st.onrender.com";

  const handlePronounce = (textToSpeak) => {
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US"; 
    utterance.pitch = 1.0; 
    utterance.rate = 0.85;  
    window.speechSynthesis.speak(utterance);
  };

  const fetchHistoryFromDB = async () => {
    try {
      const response = await fetch(`${API_URL}/api/words/history/${USER_ID}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        setHistory(resData.data);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHistoryFromDB();
  }, []);

  const handleSearchWord = async () => {
    if (!word || !word.trim()) {
      toast.error("Pehle word toh likho bhai! ✍️", {
        style: { background: "#121214", color: "#fff", border: "1px solid rgba(239,68,68,0.2)" }
      });
      return;
    }

    setLoading(true);
    setShowHistory(false); // Search karte hi drawer auto-close
    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), userId: USER_ID }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setActiveWord(resData.data.word);
        setMeaning(resData.data.meaning);
        setSentences(resData.data.sentences);
        toast.success("Word analyzed and saved to cloud! 🚀", {
          style: { background: "#121214", color: "#fff", border: "1px solid rgba(16,185,129,0.2)" }
        });
        
        handlePronounce(resData.data.word);
        setWord(""); 
        fetchHistoryFromDB(); 
      } else {
        toast.error(resData.message || "Server ne data push nahi kiya!");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Backend pipeline connect nahi ho paa rahi!");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistoryCard = (item) => {
    setActiveWord(item.word);
    setMeaning(item.meaning);
    setSentences(item.sentences);
    setShowHistory(false); // Word select hote hi list close (UX Mapping)
    
    toast.success(`${item.word.toUpperCase()} reloaded! 🕒`, {
      style: { background: "#121214", color: "#fff", border: "1px solid rgba(6,182,212,0.2)" }
    });
    handlePronounce(item.word);
  };

  return (
    <div className="min-h-screen bg-[#050507] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#08080a] to-[#050507] text-slate-100 flex flex-col items-center justify-start p-4 py-16 font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      <Toaster position="top-center" />
      
      {/* Upper Global Controller Bar (History Toggle Pin at Top-Left) */}
      <div className="w-full max-w-xl mb-4 flex justify-between items-center px-2 relative z-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all duration-300 outline-none ${
            showHistory 
              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
              : "bg-[#0b0b0e] border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
          }`}
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${showHistory ? "rotate-180 text-cyan-400" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History ({history.length})
        </button>
        <span className="text-[8px] bg-white/[0.02] border border-white/[0.05] text-slate-500 px-2 py-1 rounded-full uppercase font-bold tracking-wider">Cloud Live</span>
      </div>

      {/* Main Container Core Frame */}
      <div className="w-full max-w-xl bg-[#0b0b0e]/90 backdrop-blur-xl p-6 sm:p-8 rounded-[2.5rem] border border-white/[0.04] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Dropdown History Area */}
        {showHistory && (
          <div className="absolute inset-x-0 top-0 bg-[#0b0b0e] p-6 rounded-b-[2rem] border-b border-white/[0.06] z-40 space-y-3 shadow-2xl animate-in slide-in-from-top duration-300 max-h-[85%] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-2 mb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select From Footprints</span>
              <button onClick={() => setShowHistory(false)} className="text-[9px] font-black text-rose-400/70 hover:text-rose-400 uppercase tracking-widest">Close ✕</button>
            </div>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-600 italic text-center py-4">No cloud session items synced yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadFromHistoryCard(item)}
                    className="bg-black/40 hover:bg-black border border-white/[0.03] hover:border-cyan-500/20 p-3 rounded-xl text-left space-y-0.5 transition-all duration-200 truncate w-full group"
                  >
                    <div className="text-[11px] font-black uppercase text-slate-300 italic group-hover:text-cyan-400 truncate">{item.word}</div>
                    <div className="text-[9px] text-slate-500 font-bold group-hover:text-emerald-400/80 truncate">{item.meaning}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header Typography */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
            🤖 Dameeto Vocab Node
          </h2>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">MongoDB Cloud Synced Instance</p>
          </div>
        </div>

        {/* Input & Search Group */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="TYPE ANY ENGLISH WORD..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
            className="flex-1 bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 uppercase italic transition-all duration-300 placeholder:text-slate-800 tracking-wide shadow-[inner_0_2px_8px_rgba(0,0,0,0.5)]"
          />
          <button
            onClick={handleSearchWord}
            disabled={loading}
            className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white px-8 py-4 sm:py-0 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-[0_4px_20px_rgba(16,185,129,0.2)] transition-all duration-300 active:scale-[0.98] disabled:opacity-40 whitespace-nowrap"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analyzing...</span>
              </div>
            ) : (
              <span className="flex items-center gap-1">⚡ Analyze Node</span>
            )}
          </button>
        </div>

        {activeWord && <hr className="border-white/[0.04]" />}

        {/* Display Output Terminal */}
        {activeWord && (
          <div className="space-y-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-3">
            
            {/* Header Word Label + 🔊 Pronounce Control */}
            <div className="flex flex-col items-center justify-center bg-black/40 py-4 px-6 rounded-2xl border border-white/[0.03] shadow-inner relative gap-2">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Active Target Word</span>
              
              <div className="flex items-center justify-center gap-3 w-full">
                <h3 className="text-2xl font-black italic uppercase tracking-wide text-cyan-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.15)] truncate max-w-[75%]">
                  {activeWord}
                </h3>
                
                <button
                  onClick={() => handlePronounce(activeWord)}
                  title="Listen Pronunciation"
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 p-2.5 rounded-xl transition-all duration-200 active:scale-90 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center justify-center group/audio"
                >
                  <svg className="w-4 h-4 transform group-hover/audio:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Hindi Translation Display */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400" /> Hindi Translation
              </label>
              <div className="w-full bg-[linear-gradient(135deg,_rgba(16,185,129,0.03),_rgba(0,0,0,0.2))] border border-emerald-500/20 rounded-2xl px-5 py-4 text-lg font-bold text-emerald-400 shadow-sm flex items-center min-h-[56px]">
                {meaning}
              </div>
            </div>

            {/* Practical Sentences Terminal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest ml-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400" /> Practical Examples Matrix
              </label>
              <div className="w-full bg-black/50 border border-white/[0.04] rounded-2xl p-5 text-[13px] font-medium text-slate-300 italic whitespace-pre-line leading-relaxed shadow-inner border-l-2 border-l-cyan-500/50">
                {sentences}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}