import React from "react";

export default function VocabCard({ 
  vItem, vIdx, updateVocabValue, removeVocabSlot, 
  handleAutoTranslate, translating, mediaItems, 
  setMediaItems, updateMediaValue, setTempImage, 
  setIsCropping, setActiveMediaIndex 
}) {

  const getYTId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addMedia = () => {
    setMediaItems([...mediaItems, { type: 'image', value: "", mode: "file", vocabIndex: vIdx }]);
  };

  return (
    <div className="group relative space-y-6 p-6 bg-[#0a0a0c] rounded-2xl border border-white/5 shadow-2xl transition-all duration-500 hover:border-blue-500/40">
      
      {/* --- Subtle Outer Glow on Hover --- */}
      <div className="absolute -inset-px bg-blue-500/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* --- Delete Button: Rounded Square --- */}
      <button 
        type="button" 
        onClick={() => removeVocabSlot(vIdx)} 
        className="absolute -top-2 -right-2 w-8 h-8 bg-[#121215] border border-white/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 rounded-lg shadow-xl z-30 flex items-center justify-center transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      
      {/* --- Text Content: Sharp Typography --- */}
      <div className="relative space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Terminal Entry</label>
          <input 
            type="text" 
            placeholder="TYPE WORD..." 
            value={vItem.word} 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none font-black uppercase italic text-sm text-white placeholder:text-gray-800 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all shadow-inner" 
            onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
            onBlur={() => handleAutoTranslate(vItem.word, vIdx)} 
          />
        </div>
        
        <div className="relative group/meaning">
          <input 
            type="text" 
            placeholder="HINDI TRANSLATION" 
            value={vItem.meaning} 
            className="w-full bg-transparent border-b border-white/10 outline-none px-1 py-2 text-xs font-bold text-blue-400 italic placeholder:text-gray-800 focus:border-blue-500 transition-all" 
            onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
          />
          {translating === vIdx && (
            <div className="absolute right-0 bottom-2 flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
              <p className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">Syncing...</p>
            </div>
          )}
        </div>
        
        <textarea 
          placeholder="CONSTRUCT SENTENCE..." 
          value={vItem.sentence} 
          className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-[11px] font-medium text-gray-400 outline-none focus:border-white/20 shadow-[inner_0_2px_4px_rgba(0,0,0,0.5)] h-24 resize-none leading-relaxed transition-all"
          onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
        />
      </div>

      {/* --- Media Section: Cinematic Cards --- */}
      <div className="relative space-y-4">
        {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
          const actualIdx = mediaItems.findIndex(m => m === mItem);
          const ytId = mItem.mode === "url" ? getYTId(mItem.value) : null;
          
          const previewUrl = mItem.value instanceof File ? URL.createObjectURL(mItem.value) : mItem.value;

          return (
            <div key={actualIdx} className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden group/media">
              <div className="flex gap-2 mb-4">
                {['file', 'url'].map((mode) => (
                  <button 
                    key={mode}
                    type="button" 
                    onClick={() => updateMediaValue(actualIdx, mItem.value, mode)} 
                    className={`flex-1 py-2 rounded-lg text-[8px] font-black tracking-widest transition-all ${mItem.mode === mode ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-black/40 text-gray-600 hover:text-gray-400'}`}
                  >
                    {mode === 'file' ? 'STORAGE' : 'URL LINK'}
                  </button>
                ))}
              </div>
              
              {mItem.mode === "file" ? (
                <div className="space-y-3">
                  <div className="relative h-44 rounded-lg overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group/img">
                    {mItem.value ? (
                      <>
                        <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                        <div 
                          onClick={() => { setActiveMediaIndex(actualIdx); setTempImage(previewUrl); setIsCropping(true); }}
                          className="absolute inset-0 bg-blue-600/20 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Edit & Scan</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-2">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) { updateMediaValue(actualIdx, file, "file"); setActiveMediaIndex(actualIdx); setTempImage(URL.createObjectURL(file)); setIsCropping(true); }
                        }} />
                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">Upload Visual Signal</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="PASTE NEURAL LINK..." 
                    className="w-full bg-black/40 border border-white/5 py-3 px-4 rounded-lg outline-none text-[10px] font-bold text-blue-400" 
                    value={mItem.value || ""} 
                    onChange={(e) => updateMediaValue(actualIdx, e.target.value, "url")} 
                  />
                  {ytId && (
                    <div className="rounded-lg overflow-hidden border border-white/10 aspect-video shadow-2xl">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}?rel=0`} frameBorder="0" allowFullScreen />
                    </div>
                  )}
                </div>
              )}
              <button 
                type="button" 
                onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== actualIdx))} 
                className="absolute top-2 right-2 text-white/10 hover:text-red-500 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
              </button>
            </div>
          );
        })}

        {/* Add Media: Compact & Glowing */}
        <button 
          type="button" 
          onClick={addMedia} 
          className="w-full bg-white/5 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] border border-dashed border-white/10 text-gray-600 hover:border-blue-500/50 hover:text-blue-500 transition-all duration-300"
        >
          + Add Visual Unit
        </button>
      </div>

    </div>
  );
}