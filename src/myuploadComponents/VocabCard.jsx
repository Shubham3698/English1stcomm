import React, { useEffect } from "react";

export default function VocabCard({ 
  vItem, vIdx, updateVocabValue, removeVocabSlot, 
  handleAutoTranslate, translating, mediaItems, 
  setMediaItems, updateMediaValue, setTempImage, 
  setIsCropping, setActiveMediaIndex 
}) {

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
            if (m.url && !m.value) {
              m.value = m.url;
              needsUpdate = true;
            }
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
  }, [vItem, vIdx, updateVocabValue, mediaItems, setMediaItems]);

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
    <div className="relative p-5 flex flex-col min-h-full w-full overflow-hidden box-border">
      
      {/* 🔴 Delete Card */}
      <button type="button" onClick={() => removeVocabSlot(vIdx)} className="absolute top-4 right-4 w-9 h-9 bg-[#0d0d0f] text-gray-500 hover:text-red-500 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
      </button>

      {/* --- Section 1: Inputs --- */}
      <div className="flex-none space-y-3.5 mt-1 w-full">
        
        <div className="space-y-1 text-left pr-12 w-full">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-1">Card Subject / Title</label>
          <input 
            type="text" 
            placeholder="E.G. 'DAILY SLANGS'..." 
            value={vItem.title || ""} 
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold text-blue-400 outline-none focus:border-blue-500/30 transition-all uppercase tracking-wider placeholder:text-gray-800" 
            onChange={e => updateVocabValue(vIdx, "title", e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 gap-3.5 w-full">
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Word</label>
            <input 
              type="text" 
              placeholder="WORD..." 
              value={vItem.word || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white outline-none focus:border-blue-500 uppercase italic transition-all shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
              onBlur={() => vItem.word && handleAutoTranslate(vItem.word, vIdx)} 
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-widest ml-1">Meaning</label>
            <input 
              type="text" 
              placeholder="HINDI MEANING..." 
              value={vItem.meaning || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-green-400 outline-none focus:border-green-500 shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
            />
          </div>
        </div>
        
        <textarea 
          placeholder="SENTENCE..." 
          value={vItem.sentence || ""} 
          className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-bold text-gray-300 italic outline-none focus:border-blue-500/20 h-14 resize-none leading-relaxed transition-all shadow-inner placeholder:text-gray-800" 
          onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
        />
      </div>

      {/* --- Section 2: Media Management --- */}
      <div className="mt-4 pt-4 border-t border-white/5 flex-grow flex flex-col min-h-0 w-full">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2">Media Attachments</label>
        
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] items-center w-full">
          
          {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
            const mIdx = mediaItems.findIndex(m => m === mItem);
            const ytId = getYTId(mItem.value);
            const previewUrl = (mItem.value instanceof File) ? URL.createObjectURL(mItem.value) : mItem.value;

            return (
              <div key={mIdx} className="w-[220px] h-[230px] shrink-0 snap-center relative p-3 bg-white/[0.02] rounded-3xl border border-white/5 animate-in fade-in zoom-in duration-500 flex flex-col justify-between overflow-hidden">
                
                <div className="flex justify-between items-center mb-2 bg-black/40 p-1.5 rounded-xl border border-white/5 shrink-0">
                  {mItem.mode !== "select" && (
                     <button type="button" onClick={() => updateMediaValue(mIdx, "", "select", "image")} className="text-[8px] font-black text-gray-400 hover:text-blue-400 transition-all uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="3"/></svg> Change</button>
                  )}
                  <button type="button" onClick={() => removeMedia(mIdx)} className="w-5 h-5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center transition-all ml-auto"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg></button>
                </div>

                {mItem.mode === "select" ? (
                  <div className="flex flex-col items-center justify-center space-y-2 flex-grow w-full">
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "file", "image")} className="w-full bg-white text-black py-2.5 rounded-lg font-[1000] text-[9px] uppercase active:scale-95 transition-all">📁 FILE</button>
                    <button type="button" onClick={() => updateMediaValue(mIdx, "", "url", "video")} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-[1000] text-[9px] uppercase active:scale-95 transition-all">🔗 LINK</button>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-center min-h-0 w-full">
                    {mItem.mode === "file" && !(typeof mItem.value === 'string' && mItem.value.startsWith('http')) ? (
                      <div className="relative w-full h-[120px] rounded-xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center">
                        {mItem.value instanceof File ? (
                          <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                        ) : (
                          <div className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-blue-500/20">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) { updateMediaValue(mIdx, file, "file", "image"); setActiveMediaIndex(mIdx); setTempImage(URL.createObjectURL(file)); setIsCropping(true); }
                            }} />
                            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Select Image</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col w-full space-y-2">
                        <input 
                          type="text" 
                          placeholder="PASTE URL..." 
                          className="w-full bg-black border border-white/10 py-2 px-3 rounded-lg outline-none text-[9px] font-bold text-blue-400 focus:border-blue-500/40" 
                          value={typeof mItem.value === 'string' ? mItem.value : ""} 
                          onChange={(e) => handleUrlChange(mIdx, e.target.value)} 
                        />
                        {ytId ? (
                          <div className="w-full h-[90px] rounded-xl overflow-hidden border border-white/10 relative">
                            <iframe className="w-full h-full pointer-events-none opacity-60" src={`https://www.youtube.com/embed/${ytId}?rel=0&controls=0`} frameBorder="0" title="preview" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="bg-blue-600 px-2 py-1 rounded-md text-[7px] font-black text-white uppercase shadow-xl border border-blue-400">Video</div></div>
                          </div>
                        ) : mItem.value && typeof mItem.value === 'string' && mItem.value.startsWith('http') && (
                          <div className="w-full h-[90px] rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            <img src={mItem.value} className="w-full h-full object-cover" alt="preview" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={addMedia} className="w-[160px] h-[230px] shrink-0 snap-center rounded-3xl bg-blue-600/5 border-2 border-dashed border-blue-500/20 text-blue-500 font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg flex flex-col items-center justify-center gap-2">
            <span className="text-2xl font-light">+</span> Add Media
          </button>
        </div>
      </div>
    </div>
  );
}