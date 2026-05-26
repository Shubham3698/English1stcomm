import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VocabPage() {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [sentences, setSentences] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [explanation, setExplanation] = useState("");
  const [synonyms, setSynonyms] = useState("");
  const [antonyms, setAntonyms] = useState("");

  const [activeWord, setActiveWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // --- STRICTLY AUTHENTICATED USER STATE ---
  const [userEmail, setUserEmail] = useState("");

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000"
      : "https://serdeptry1st.onrender.com";

  // 1. Initial Load: Correct Key "eng_userEmail" se data uthana
  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("eng_userEmail");
    
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail.trim());
    } else {
      setUserEmail("guest_user@gmail.com"); 
    }
  }, []);

  const handlePronounce = (textToSpeak) => {
    if (!textToSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // 2. Database se is current logged-in user ki history fetch karna
  const fetchHistoryFromDB = async () => {
    if (!userEmail) return;
    try {
      const response = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
      const resData = await response.json();
      if (response.ok && resData.success) {
        setHistory(resData.data);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchHistoryFromDB();
    }
  }, [userEmail]);

  const handleSearchWord = async (wordToSearch = word, isAlternative = false) => {
    const searchTarget = wordToSearch ? wordToSearch.trim() : "";

    if (!searchTarget) {
      toast.error("Pehle word likho ✍️");
      return;
    }

    if (!userEmail || userEmail === "guest_user@gmail.com") {
      toast.error("Bhai pehle Login karo! 🚫");
      return;
    }

    setLoading(true);
    setShowHistory(false);

    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: searchTarget,
          userId: userEmail, 
          getAlternative: isAlternative,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setActiveWord(resData.data.word);
        setPartOfSpeech(resData.data.partOfSpeech);
        setMeaning(resData.data.meaning);
        setExplanation(resData.data.explanation);
        setSynonyms(resData.data.synonyms);
        setAntonyms(resData.data.antonyms);
        setSentences(resData.data.sentences);

        if (isAlternative) {
          toast.success("Nayi meaning generated! 🔄");
        } else {
          toast.success("Word analyzed 🚀");
        }

        handlePronounce(resData.data.word);
        setWord("");
        fetchHistoryFromDB(); 
      } else {
        toast.error(resData.message || "Server ne data push nahi kiya!");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Backend connect nahi ho raha!");
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistoryCard = (item) => {
    setActiveWord(item.word);
    setPartOfSpeech(item.partOfSpeech || "Vocabulary");
    setMeaning(item.meaning);
    setExplanation(item.explanation);
    setSynonyms(item.synonyms);
    setAntonyms(item.antonyms);
    setSentences(item.sentences);
    setShowHistory(false);
    handlePronounce(item.word);
  };

  const totalUniqueWords = new Set(history.map(item => item.word.toLowerCase())).size;

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10">
      <Toaster position="top-center" />

      {/* --- DASHBOARD USER PROFILE SUMMARY STRIP --- */}
      <div className="w-full max-w-xl bg-[#0b0b0e] border border-white/5 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-lg">
        <div className="flex flex-col min-w-0 flex-1 pr-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Logged In As</span>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-cyan-400 font-mono font-medium truncate">
              {userEmail === "guest_user@gmail.com" ? "Guest Mode (Not Logged In)" : userEmail}
            </span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center flex-shrink-0">
          <div className="text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Total Queries</span>
            <span className="text-sm font-black text-white">{history.length}</span>
          </div>
          <div className="text-right border-l border-white/10 pl-4">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-tight">Unique Words</span>
            <span className="text-sm font-black text-emerald-400">{totalUniqueWords}</span>
          </div>
        </div>
      </div>

      {/* Header Utilities */}
      <div className="w-full max-w-xl flex justify-between items-center mb-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="bg-[#0b0b0e] border border-white/10 px-4 py-2 rounded-xl text-[11px] font-black tracking-wider uppercase text-slate-300 transition-all hover:bg-white/5"
        >
          {showHistory ? "Close History ✕" : "View Complete Stack"}
        </button>
        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Cloud Connected</span>
      </div>

      <div className="w-full max-w-xl bg-[#0b0b0e] border border-white/[0.05] rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
        
        {/* History Panel */}
        {showHistory && (
          <div className="space-y-2">
            <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1 px-1">
              Your Personal Search History ({history.length} logs):
            </div>
            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-600 uppercase font-bold bg-black/20 rounded-2xl border border-white/5">
                No history data linked to {userEmail} yet 🔍
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-black/30 rounded-2xl border border-white/5">
                {history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => loadFromHistoryCard(item)}
                    className="bg-black/40 border border-white/[0.05] hover:border-cyan-500/30 rounded-xl p-3 text-left transition-all"
                  >
                    <div className="text-cyan-400 text-[11px] uppercase font-black truncate">
                      {item.word}
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-0.5">
                      {item.meaning}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Title branding */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black italic uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
            🤖 Dameeto Vocab Node
          </h2>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
            AI-Driven Structural Lexicon
          </p>
        </div>

        {/* Action input strip */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="TYPE ANY WORD..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchWord()}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 py-4 outline-none text-white font-medium placeholder-slate-600 focus:border-cyan-500/50 transition-all text-sm tracking-wide"
          />
          <button
            onClick={() => handleSearchWord()}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90 active:scale-95 px-7 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/20"
          >
            {loading ? "Analyzing..." : "⚡ Analyze"}
          </button>
        </div>

        {/* --- CONVERSATIONAL CHAT UI REPLACEMENT --- */}
        {activeWord && (
          <div className="border-t border-white/5 pt-6 space-y-4">
            
            {/* User Message Bubble */}
            <div className="flex flex-col items-end space-y-1 pl-12">
              <div className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs font-semibold leading-relaxed shadow-md">
                Mujhe <span className="underline uppercase font-black text-yellow-300">{activeWord}</span> ka exact Hindi meaning, simple setup explanation aur practical examples ke sath samjhao! 🙌
              </div>
              <span className="text-[9px] uppercase font-bold text-slate-600 mr-1">You</span>
            </div>

            {/* AI Assistant Message Bubble Response */}
            <div className="flex flex-col items-start space-y-1 pr-8">
              <div className="w-full bg-black/40 border border-white/[0.05] rounded-2xl rounded-tl-sm p-5 space-y-5 shadow-inner">
                
                {/* Header Action inside Assistant block */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xl font-black italic uppercase text-cyan-400 tracking-wide flex items-center gap-2">
                      {activeWord}
                      <span className="bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] text-indigo-300 font-black normal-case">
                        {partOfSpeech}
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => handlePronounce(activeWord)}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-3 py-1.5 rounded-xl text-cyan-400 text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    🔊 Listen
                  </button>
                </div>

                {/* AI Answers Layout breakdown */}
                <div className="space-y-4 text-[13px] leading-relaxed">
                  
                  {/* Point 1: Meaning */}
                  <div>
                    <p className="text-slate-400 font-medium">
                      👉 <span className="text-emerald-400 font-bold">Hindi Meaning:</span> Iska seedha matlab hota hai — <span className="text-emerald-300 font-extrabold text-base">{meaning}</span>.
                    </p>
                  </div>

                  {/* Point 2: Explanation */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <p className="text-amber-400 font-black text-[10px] uppercase tracking-wider mb-1">💡 Simple Explanation:</p>
                    <p className="text-slate-300 italic">{explanation}</p>
                  </div>

                  {/* Point 3: Sentences */}
                  <div>
                    <p className="text-cyan-400 font-black text-[10px] uppercase tracking-wider mb-1">📝 Practical Sentences:</p>
                    <div className="text-slate-300 whitespace-pre-line pl-2 border-l-2 border-cyan-500/30 space-y-1 font-mono text-xs">
                      {sentences}
                    </div>
                  </div>

                  {/* Point 4: Synonyms / Antonyms Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-[12px]">
                    <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-xl p-3">
                      <span className="text-indigo-400 font-black text-[9px] uppercase block mb-1">✨ Similar Words</span>
                      <span className="text-slate-300 font-medium">{synonyms || "N/A"}</span>
                    </div>
                    <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-xl p-3">
                      <span className="text-rose-400 font-black text-[9px] uppercase block mb-1">⚡ Opposite Words</span>
                      <span className="text-slate-300 font-medium">{antonyms || "N/A"}</span>
                    </div>
                  </div>

                </div>

                {/* Regenerate Action nested cleanly inside system frame */}
                <div className="flex justify-end border-t border-white/5 pt-3">
                  <button
                    onClick={() => handleSearchWord(activeWord, true)}
                    disabled={loading}
                    className="text-[9px] bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-lg font-black transition-all uppercase tracking-wider"
                  >
                    {loading ? "Regenerating..." : "🔄 Change Context / New Meaning"}
                  </button>
                </div>

              </div>
              <span className="text-[9px] uppercase font-bold text-emerald-500 ml-1">Dameeto Node Bot</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}