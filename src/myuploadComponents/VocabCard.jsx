import React, { useEffect } from "react";

export default function VocabCard({ 
  vItem, vIdx, updateVocabValue, removeVocabSlot, 
  handleAutoTranslate, translating, mediaItems, 
  setMediaItems, updateMediaValue, setTempImage, 
  setIsCropping, setActiveMediaIndex 
}) {

  // --- 1. 🔥 MASTER SYNC ENGINE (For Edit Mode) ---
  useEffect(() => {
    if (vItem) {
      // ✅ Title Sync Logic: Agar backend se title aaya hai toh turant parent state sync karo
      if (vItem.title && !vItem.isSynced) {
        updateVocabValue(vIdx, "title", vItem.title);
        // Is flag ko direct item mein set kar rahe hain loop rokne ke liye
        vItem.isSynced = true; 
      }

      const syncMedia = () => {
        let needsUpdate = false;
        const newMediaItems = [...mediaItems];

        newMediaItems.forEach((m) => {
          if (m.vocabIndex === vIdx) {
            // Backend 'url' ko frontend 'value' mein map karna
            if (m.url && !m.value) {
              m.value = m.url;
              needsUpdate = true;
            }
            
            // Auto-detect mode for Preview
            if (typeof m.value === 'string' && m.value.startsWith('http')) {
              const isYT = m.value.includes('youtube') || m.value.includes('youtu.be') || m.value.includes('/shorts/');
              if (m.mode === 'select' || !m.mode) {
                m.mode = 'url'; 
                m.type = isYT ? 'video' : 'image';
                needsUpdate = true;
              }
            }
          }
        });
        if (needsUpdate) setMediaItems(newMediaItems);
      };
      syncMedia();
    }
  }, [vItem, vIdx, updateVocabValue, vIdx]); // Dependency list updated

  // --- 2. HELPERS ---
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

  const addMedia = () => {
    setMediaItems([...mediaItems, { type: 'image', value: "", mode: "select", vocabIndex: vIdx }]);
  };

  const removeMedia = (mIdx) => {
    setMediaItems(mediaItems.filter((_, i) => i !== mIdx));
  };

  return (
    <div className="relative p-6 bg-[#111114] rounded-[2rem] border border-white/5 shadow-2xl mb-10 transition-all hover:border-blue-500/30 group">
      
      {/* 🔴 Delete Card */}
      <button type="button" onClick={() => removeVocabSlot(vIdx)} className="absolute -top-3 -right-3 w-10 h-10 bg-[#0d0d0f] text-gray-500 hover:text-red-500 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
      </button>

      {/* --- Section 1: Inputs --- */}
      <div className="space-y-5">
        
        {/* 🔥 FIXED TITLE INPUT 🔥 */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Card Subject / Title</label>
          <input 
            type="text" 
            placeholder="E.G. 'DAILY SLANGS'..." 
            // ✅ Fix: Direct value mapping with fallback
            value={vItem.title || ""} 
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-blue-400 outline-none focus:border-blue-500/30 transition-all uppercase tracking-wider placeholder:text-gray-800" 
            onChange={e => updateVocabValue(vIdx, "title", e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Word</label>
            <input 
              type="text" 
              placeholder="WORD..." 
              value={vItem.word || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-lg font-black text-white outline-none focus:border-blue-500 uppercase italic transition-all shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
              onBlur={() => vItem.word && handleAutoTranslate(vItem.word, vIdx)} 
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-1">Meaning</label>
            <input 
              type="text" 
              placeholder="HINDI MEANING..." 
              value={vItem.meaning || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-lg font-black text-green-400 outline-none focus:border-green-500 shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
            />
          </div>
        </div>
        
        <textarea 
          placeholder="SENTENCE..." 
          value={vItem.sentence || ""} 
          className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs font-bold text-gray-300 italic outline-none focus:border-blue-500/20 h-20 resize-none leading-relaxed transition-all shadow-inner placeholder:text-gray-800" 
          onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
        />
      </div>

      {/* --- Section 2: Media Management --- */}
      <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
        {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
          const mIdx = mediaItems.findIndex(m => m === mItem);
          const ytId = getYTId(mItem.value);
          const previewUrl = (mItem.value instanceof File) ? URL.createObjectURL(mItem.value) : mItem.value;

          return (
            <div key={mIdx} className="relative p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-in fade-in zoom-in duration-500 group/media">
              
              {/* Action Bar */}
              <div className="flex justify-between items-center mb-4 bg-black/40 p-2 rounded-xl border border-white/5">
                {mItem.mode !== "select" && (
                   <button type="button" onClick={() => updateMediaValue(mIdx, "", "select", "image")} className="text-[9px] font-black text-gray-400 hover:text-blue-400 transition-all uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="3"/></svg> Change Source</button>
                )}
                <button type="button" onClick={() => removeMedia(mIdx)} className="w-7 h-7 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all ml-auto"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
              </div>

              {mItem.mode === "select" ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="flex gap-4 w-full max-w-xs">
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "file", "image")} className="flex-1 bg-white text-black py-4 rounded-2xl font-[1000] text-[10px] uppercase active:scale-95 transition-all">📁 FILE</button>
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "url", "video")} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-[1000] text-[10px] uppercase active:scale-95 transition-all">🔗 LINK</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {mItem.mode === "file" && !(typeof mItem.value === 'string' && mItem.value.startsWith('http')) ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group/img">
                      {mItem.value instanceof File ? (
                        <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                      ) : (
                        <div className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-blue-500/20 py-10">
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
                        placeholder="PASTE YOUTUBE OR IMAGE URL..." 
                        className="w-full bg-black border border-white/10 py-4 px-5 rounded-2xl outline-none text-xs font-bold text-blue-400 focus:border-blue-500/40" 
                        value={typeof mItem.value === 'string' ? mItem.value : ""} 
                        onChange={(e) => handleUrlChange(mIdx, e.target.value)} 
                      />
                      {ytId ? (
                        <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl relative">
                          <iframe className="w-full h-full pointer-events-none opacity-60" src={`https://www.youtube.com/embed/${ytId}?rel=0&controls=0`} frameBorder="0" title="preview" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-blue-600 px-4 py-2 rounded-lg text-[9px] font-black text-white uppercase shadow-xl border border-blue-400">Video Detected</div></div>
                        </div>
                      ) : mItem.value && typeof mItem.value === 'string' && mItem.value.startsWith('http') && (
                        <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl bg-black/40"><img src={mItem.value} className="w-full h-full object-contain" alt="preview" /></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button type="button" onClick={addMedia} className="w-full py-4.5 rounded-[1.5rem] bg-blue-600/5 border-2 border-dashed border-blue-500/20 text-blue-500 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg">+ Add Media Unit</button>
      </div>
    </div>
  );
}