import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function VocabPage() {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [sentences, setSentences] = useState("");
  const [loadingMeaning, setLoadingMeaning] = useState(false);
  const [loadingSentences, setLoadingSentences] = useState(false);

  // Render ka backend URL ya localhost
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://serdeptry1st.onrender.com";

  const handleFetchData = async (fieldType) => {
    if (!word || !word.trim()) {
      toast.error("Pehle word toh likho bhai! ✍️");
      return;
    }

    if (fieldType === "meaning") setLoadingMeaning(true);
    if (fieldType === "sentence") setLoadingSentences(true);

    try {
      const response = await fetch(`${API_URL}/api/words/define`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: word.trim(), type: fieldType }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        if (fieldType === "meaning") {
          setMeaning(resData.data);
          toast.success("Hindi Meaning aa gaya! 🎉");
        } else {
          setSentences(resData.data);
          toast.success("Examples aa gaye! 🔥");
        }
      } else {
        toast.error(resData.message || "Server ne response nahi diya!");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Backend connect nahi ho paa raha!");
    } finally {
      setLoadingMeaning(false);
      setLoadingSentences(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md bg-[#0e0e11] p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-black italic uppercase tracking-wider bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            🤖 ChatGPT Vocab Generator
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Instant Dictionary Node</p>
        </div>

        {/* Word Input */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-1">Target Word</label>
          <input
            type="text"
            placeholder="TYPE ANY WORD HERE..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3.5 text-sm font-black outline-none focus:border-emerald-500 uppercase italic transition-all shadow-inner placeholder:text-gray-700"
          />
        </div>

        {/* Buttons to Fetch */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleFetchData("meaning")}
            disabled={loadingMeaning}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 px-4 rounded-xl font-black uppercase text-[9px] tracking-wider shadow-lg transition-all active:scale-95 disabled:opacity-40"
          >
            {loadingMeaning ? "Fetching..." : "💡 Get Meaning"}
          </button>
          <button
            onClick={() => handleFetchData("sentence")}
            disabled={loadingSentences}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl font-black uppercase text-[9px] tracking-wider shadow-lg transition-all active:scale-95 disabled:opacity-40"
          >
            {loadingSentences ? "Drafting..." : "📝 Get Sentences"}
          </button>
        </div>

        <hr className="border-white/[0.03]" />

        {/* Output Fields */}
        <div className="space-y-4">
          {/* Meaning Result */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Hindi Translation</label>
            <div className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-emerald-400 min-h-[48px] flex items-center">
              {meaning || <span className="text-gray-700 italic text-[11px]">Meaning text will appear here...</span>}
            </div>
          </div>

          {/* Sentences Result */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Practical Examples Matrix</label>
            <div className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-[12px] font-medium text-gray-300 italic whitespace-pre-line min-h-[100px] leading-relaxed">
              {sentences || <span className="text-gray-700 italic text-[11px]">Example sentences will appear here...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}