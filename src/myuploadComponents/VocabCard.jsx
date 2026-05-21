import React, { useEffect, useState } from "react";

export default function VocabCard({ 
  vItem, vIdx, updateVocabValue, removeVocabSlot, 
  mediaItems, setMediaItems, updateMediaValue, setTempImage, 
  setIsCropping, setActiveMediaIndex 
}) {

  // Individual loaders for smooth click feeling
  const [loadingMeaning, setLoadingMeaning] = useState(false);
  const [loadingSentence, setLoadingSentence] = useState(false);

  // --- 1. 🔥 MASTER SYNC ENGINE (Kept Intact) ---
  useEffect(() => {
    if (vItem) {
      if (vItem.title && !vItem.isSynced) {
        updateVocabValue(vIdx, "title", vItem.title);
        vItem.isSynced = true; 
      }
      const syncMedia = () => {
        let needsUpdate = false;
        const newMediaItems = [...mediaItems];
        newMediaItems.forEach((m) => {
          if (m.vocabIndex === vIdx) {
            if (m.url && !m.value) { m.value = m.url; needsUpdate = true; }
            if (typeof m.value === 'string' && m.value.startsWith('http')) {
              const isYT = m.value.includes('youtube') || m.value.includes('youtu.be') || m.value.includes('/shorts/');
              if (m.mode === 'select' || !m.mode) { m.mode = 'url'; m.type = isYT ? 'video' : 'image'; needsUpdate = true; }
            }
          }
        });
        if (needsUpdate) setMediaItems(newMediaItems);
      };
      syncMedia();
    }
  }, [vItem, vIdx, updateVocabValue]);

  // --- 2. SINGLE STREAM FOCUS HANDLER ---
  const handleFieldFocus = async (fieldType) => {
    // Agar Word hi nahi likha ya data pehle se field me bhara hai toh request mat bhejo
    if (!vItem.word || !vItem.word.trim()) return;
    if (fieldType === "meaning" && vItem.meaning) return;
    if (fieldType === "sentence" && vItem.sentence) return;

    if (fieldType === "meaning") setLoadingMeaning(true);
    if (fieldType === "sentence") setLoadingSentence(true);

    try {
      const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api/words/define' 
        : 'https://serdeptry1st.onrender.com/api/words/define';

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          word: vItem.word.trim(), 
          type: fieldType // "meaning" or "sentence"
        })
      });
      const resData = await res.json();
      
      if (res.ok && resData.success) {
        updateVocabValue(vIdx, fieldType, resData.data);
      }
    } catch (err) {
      console.error("Focus translation broken:", err);
    } finally {
      setLoadingMeaning(false);
      setLoadingSentence(false);
    }
  };

  const getYTId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleUrlChange = (mIdx, val) => {
    const trimmedVal = val.trim();
    const isYouTube = trimmedVal.includes('youtube.com') || trimmedVal.includes('youtu.be') || trimmedVal.includes('/shorts/');
    const forcedType = isYouTube ? 'video' : 'image'; 
    updateMediaValue(mIdx, trimmedVal, "url", forcedType);
  };

  return (
    <div className="relative p-6 bg-[#111114] rounded-[2rem] border border-white/5 shadow-2xl mb-10 transition-all hover:border-blue-500/30 group">
      
      {/* Delete Card */}
      <button type="button" onClick={() => removeVocabSlot(vIdx)} className="absolute -top-3 -right-3 w-10 h-10 bg-[#0d0d0f] text-gray-500 hover:text-red-500 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
      </button>

      {/* --- Section 1: Inputs --- */}
      <div className="space-y-5">
        
        {/* Title input */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Card Subject / Title</label>
          <input 
            type="text" 
            placeholder="E.G. 'DAILY SLANGS'..." 
            value={vItem.title || ""} 
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-blue-400 outline-none focus:border-blue-500/30 transition-all uppercase tracking-wider placeholder:text-gray-800" 
            onChange={e => updateVocabValue(vIdx, "title", e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Word (No auto triggers here, pure user entry) */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Word</label>
            <input 
              type="text" 
              placeholder="WORD..." 
              value={vItem.word || ""} 
              className="w-full bg-black/40 border border-white/10 text-white rounded-2xl px-5 py-4 text-lg font-black outline-none focus:border-blue-500 uppercase italic transition-all shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
            />
          </div>
          
          {/* Meaning (Triggers only when clicked/focused) */}
          <div className="space-y-1.5 text-left relative">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-1 flex justify-between">
              <span>Meaning</span>
              {loadingMeaning && <span className="text-[9px] text-green-400 animate-pulse lowercase">Fetching Hindi...</span>}
            </label>
            <input 
              type="text" 
              placeholder={loadingMeaning ? "Gemini thinking..." : "CLICK TO LOAD MEANING..."}
              value={vItem.meaning || ""} 
              disabled={loadingMeaning}
              onFocus={() => handleFieldFocus("meaning")}
              className={`w-full bg-black/40 border ${loadingMeaning ? 'border-green-500/40' : 'border-white/10'} rounded-2xl px-5 py-4 text-lg font-black text-green-400 outline-none focus:border-green-500 shadow-inner placeholder:text-gray-700`} 
              onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
            />
          </div>
        </div>
        
        {/* Sentence Block (Triggers only when clicked/focused) */}
        <div className="space-y-1.5 text-left relative">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex justify-between">
            <span>Examples</span>
            {loadingSentence && <span className="text-[9px] text-blue-400 animate-pulse lowercase">Generating Sentences...</span>}
          </label>
          <textarea 
            placeholder={loadingSentence ? "Gemini rewriting everyday scenarios..." : "CLICK TO GENERATE DAILY LIFE SENTENCES..."}
            value={vItem.sentence || ""} 
            disabled={loadingSentence}
            onFocus={() => handleFieldFocus("sentence")}
            className={`w-full bg-black/40 border ${loadingSentence ? 'border-blue-500/40' : 'border-white/5'} rounded-2xl p-5 text-xs font-bold text-gray-300 italic outline-none focus:border-blue-500/20 h-32 resize-none leading-relaxed transition-all shadow-inner placeholder:text-gray-700`} 
            onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
          />
        </div>
      </div>

      {/* --- Section 3: Media Management (Kept Original) --- */}
      <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
        {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
          const mIdx = mediaItems.findIndex(m => m === mItem);
          const ytId = getYTId(mItem.value);
          const previewUrl = (mItem.value instanceof File) ? URL.createObjectURL(mItem.value) : mItem.value;

          return (
            <div key={mIdx} className="relative p-5 bg-white/[0.02] rounded-3xl border border-white/5 group/media">
              <div className="flex justify-between items-center mb-4 bg-black/40 p-2 rounded-xl border border-white/5">
                {mItem.mode !== "select" && (
                   <button type="button" onClick={() => updateMediaValue(mIdx, "", "select", "image")} className="text-[9px] font-black text-gray-400 hover:text-blue-400 transition-all uppercase flex items-center gap-1">Change Source</button>
                )}
                <button type="button" onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== mIdx))} className="w-7 h-7 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all ml-auto"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
              </div>

              {mItem.mode === "select" ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="flex gap-4 w-full max-w-xs">
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "file", "image")} className="flex-1 bg-white text-black py-4 rounded-2xl font-[1000] text-[10px] uppercase transition-all">📁 FILE</button>
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "url", "video")} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-[1000] text-[10px] uppercase transition-all">🔗 LINK</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mItem.mode === "file" && !(typeof mItem.value === 'string' && mItem.value.startsWith('http')) ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
                      {mItem.value instanceof File ? (
                        <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                      ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 py-10">
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) { updateMediaValue(mIdx, file, "file", "image"); setActiveMediaIndex(mIdx); setTempImage(URL.createObjectURL(file)); setIsCropping(true); }
                          }} />
                          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Select Image</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <input 
                        type="text" 
                        placeholder="PASTE URL..." 
                        className="w-full bg-black border border-white/10 py-4 px-5 rounded-2xl outline-none text-xs font-bold text-blue-400 focus:border-blue-500/40" 
                        value={typeof mItem.value === 'string' ? mItem.value : ""} 
                        onChange={(e) => handleUrlChange(mIdx, e.target.value)} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button type="button" onClick={() => setMediaItems([...mediaItems, { type: 'image', value: "", mode: "select", vocabIndex: vIdx }])} className="w-full py-4.5 rounded-[1.5rem] bg-blue-600/5 border-2 border-dashed border-blue-500/20 text-blue-500 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg">+ Add Media Unit</button>
      </div>
    </div>
  );
}