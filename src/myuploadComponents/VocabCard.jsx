import React, { useEffect } from "react";

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
    // Media item mein vIdx (Vocab Index) attach karna zaroori hai
    setMediaItems([...mediaItems, { type: 'image', value: "", mode: "file", vocabIndex: vIdx }]);
  };

  const removeMedia = (indexToRemove) => {
    setMediaItems(mediaItems.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="group relative space-y-6 p-6 bg-[#0d0d0f] rounded-2xl border border-white/5 shadow-2xl transition-all duration-500 hover:border-blue-500/30">
      
      {/* Outer Glow */}
      <div className="absolute -inset-px bg-blue-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Delete Slot Button */}
      <button 
        type="button" 
        onClick={() => removeVocabSlot(vIdx)} 
        className="absolute -top-2 -right-2 w-8 h-8 bg-[#121215] border border-white/10 text-gray-500 hover:text-red-500 hover:border-red-500/50 rounded-lg shadow-xl z-30 flex items-center justify-center transition-all active:scale-90"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      
      {/* Text Content Section */}
      <div className="relative space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Vocab Entry #{vIdx + 1}</label>
          <input 
            type="text" 
            placeholder="ENTER WORD..." 
            value={vItem.word || ""} 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-none font-black uppercase italic text-sm text-white placeholder:text-gray-800 focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all shadow-inner" 
            onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
            onBlur={() => vItem.word && handleAutoTranslate(vItem.word, vIdx)} 
          />
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="HINDI MEANING..." 
            value={vItem.meaning || ""} 
            className="w-full bg-transparent border-b border-white/10 outline-none px-1 py-2 text-xs font-bold text-blue-400 italic placeholder:text-gray-800 focus:border-blue-500 transition-all uppercase" 
            onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
          />
          {translating === vIdx && (
            <div className="absolute right-0 bottom-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">Translating...</p>
            </div>
          )}
        </div>
        
        {/* Sentence Strip */}
        <div className="relative mt-2">
          {vItem.sentence && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>}
          <textarea 
            placeholder="CONSTRUCT A SENTENCE..." 
            value={vItem.sentence || ""} 
            className={`w-full bg-[#121215] border border-white/5 rounded-xl p-4 ${vItem.sentence ? 'pl-6' : 'pl-4'} text-[11px] font-bold text-gray-300 italic outline-none focus:border-blue-500/20 shadow-inner h-20 resize-none leading-relaxed transition-all`}
            onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
          />
        </div>
      </div>

      {/* Media Section */}
      <div className="relative space-y-4">
        {mediaItems.map((mItem, mIdx) => {
          // IMPORTANT: Only show media belonging to this specific vocab card
          if (mItem.vocabIndex !== vIdx) return null;

          const ytId = mItem.mode === "url" ? getYTId(mItem.value) : null;
          const previewUrl = (mItem.value instanceof File) ? URL.createObjectURL(mItem.value) : mItem.value;

          return (
            <div key={mIdx} className="p-4 bg-white/5 rounded-xl border border-white/10 shadow-inner relative overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Mode Switcher */}
              <div className="flex gap-2 mb-4">
                <button 
                  type="button" 
                  onClick={() => updateMediaValue(mIdx, "", "file")} 
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black tracking-widest transition-all ${mItem.mode === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/40 text-gray-600'}`}
                >
                  FILE STORAGE
                </button>
                <button 
                  type="button" 
                  onClick={() => updateMediaValue(mIdx, "", "url")} 
                  className={`flex-1 py-2 rounded-lg text-[8px] font-black tracking-widest transition-all ${mItem.mode === 'url' ? 'bg-blue-600 text-white shadow-lg' : 'bg-black/40 text-gray-600'}`}
                >
                  URL LINK
                </button>
              </div>
              
              {mItem.mode === "file" ? (
                <div className="relative h-44 rounded-lg overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group/img">
                  {mItem.value ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                      <div 
                        onClick={() => { setActiveMediaIndex(mIdx); setTempImage(previewUrl); setIsCropping(true); }}
                        className="absolute inset-0 bg-blue-600/40 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                      >
                        <span className="bg-white text-blue-600 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-2xl">Crop & Optimize</span>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 hover:border-blue-500/20 transition-colors">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          updateMediaValue(mIdx, file, "file");
                          setActiveMediaIndex(mIdx);
                          setTempImage(URL.createObjectURL(file));
                          setIsCropping(true);
                        }
                      }} />
                      <p className="text-[9px] font-black text-gray-600 uppercase">Click to Upload Image</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="PASTE YOUTUBE OR IMAGE URL..." 
                    className="w-full bg-black/40 border border-white/5 py-3 px-4 rounded-lg outline-none text-[10px] font-bold text-blue-400 placeholder:text-gray-800" 
                    value={typeof mItem.value === 'string' ? mItem.value : ""} 
                    onChange={(e) => updateMediaValue(mIdx, e.target.value, "url")} 
                  />
                  {ytId && (
                    <div className="rounded-lg overflow-hidden border border-white/10 aspect-video shadow-2xl">
                      <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}?rel=0`} frameBorder="0" allowFullScreen title="yt-preview" />
                    </div>
                  )}
                </div>
              )}

              {/* Remove Individual Media */}
              <button 
                type="button" 
                onClick={() => removeMedia(mIdx)} 
                className="absolute top-2 right-2 text-white/20 hover:text-red-500 transition-colors p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
              </button>
            </div>
          );
        })}

        <button 
          type="button" 
          onClick={addMedia} 
          className="w-full bg-blue-600/5 py-4 rounded-xl text-[9px] font-[1000] uppercase tracking-[0.3em] border border-dashed border-blue-500/20 text-blue-500/60 hover:bg-blue-600 hover:text-white hover:border-solid transition-all duration-300 active:scale-[0.98]"
        >
          + Add Media Unit
        </button>
      </div>
    </div>
  );
}