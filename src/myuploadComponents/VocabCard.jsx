import React from "react";

export default function VocabCard({ 
  vItem, vIdx, updateVocabValue, removeVocabSlot, 
  handleAutoTranslate, translating, mediaItems, 
  setMediaItems, updateMediaValue, setTempImage, 
  setIsCropping, setActiveMediaIndex 
}) {

  const getYTId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 🔥 Smart Type Detection (YouTube check)
  const handleUrlChange = (mIdx, val) => {
    const isYouTube = val.includes('youtube.com') || val.includes('youtu.be') || val.includes('/shorts/');
    const forcedType = isYouTube ? 'video' : 'image'; 
    updateMediaValue(mIdx, val, "url", forcedType);
  };

  const addMedia = () => {
    // Initial mode is 'select' to let user choose between FILE or LINK
    setMediaItems([...mediaItems, { type: 'image', value: "", mode: "select", vocabIndex: vIdx }]);
  };

  const removeMedia = (mIdx) => {
    setMediaItems(mediaItems.filter((_, i) => i !== mIdx));
  };

  return (
    <div className="relative p-6 bg-[#111114] rounded-[2rem] border border-white/5 shadow-2xl mb-10 transition-all hover:border-blue-500/30 group">
      
      {/* 🔴 Delete Slot Button */}
      <button 
        type="button" 
        onClick={() => removeVocabSlot(vIdx)} 
        className="absolute -top-3 -right-3 w-10 h-10 bg-[#0d0d0f] text-gray-500 hover:text-red-500 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* --- Section 1: Texts --- */}
      <div className="space-y-5">
        {/* 🔥 FIXED: Card Subject (Title) - Auto-fills on edit now */}
        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Signal Group / Title</label>
          <input 
            type="text" 
            placeholder="E.G. 'TOP SLANGS' OR 'MOVIE CONTEXT'..." 
            value={vItem.title || ""} 
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-bold text-blue-400 outline-none focus:border-blue-500/30 transition-all uppercase tracking-wider placeholder:text-gray-800" 
            onChange={e => updateVocabValue(vIdx, "title", e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Vocabulary Word</label>
            <input 
              type="text" 
              placeholder="ENTER WORD..." 
              value={vItem.word || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-lg font-black text-white outline-none focus:border-blue-500 uppercase italic transition-all shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
              onBlur={() => vItem.word && handleAutoTranslate(vItem.word, vIdx)} 
            />
          </div>

          <div className="space-y-1.5 relative text-left">
            <label className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] ml-1">Native Meaning</label>
            <input 
              type="text" 
              placeholder="HINDI MEANING..." 
              value={vItem.meaning || ""} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-lg font-black text-green-400 outline-none focus:border-green-500 transition-all shadow-inner placeholder:text-gray-800" 
              onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
            />
            {translating === vIdx && (
              <div className="absolute right-4 bottom-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <span className="text-[8px] font-bold text-blue-500 uppercase">AI Translating</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] ml-1">Usage / Sentence</label>
          <textarea 
            placeholder="CONSTRUCT A SENTENCE..." 
            value={vItem.sentence || ""} 
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-xs font-bold text-gray-300 italic outline-none focus:border-blue-500/20 h-24 resize-none leading-relaxed transition-all shadow-inner placeholder:text-gray-800"
            onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
          />
        </div>
      </div>

      {/* --- Section 2: Media Management --- */}
      <div className="mt-8 pt-8 border-t border-white/5 space-y-5">
        <div className="grid grid-cols-1 gap-5">
          {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
            const mIdx = mediaItems.findIndex(m => m === mItem);
            const ytId = mItem.mode === "url" ? getYTId(mItem.value) : null;
            const previewUrl = (mItem.value instanceof File) ? URL.createObjectURL(mItem.value) : mItem.value;

            return (
              <div key={mIdx} className="relative p-5 bg-white/[0.02] rounded-3xl border border-white/5 animate-in fade-in zoom-in duration-500 group/media">
                
                {/* 🎯 SELECTION PILLS (FILE / LINK) */}
                {mItem.mode === "select" ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-5">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Choose Content Type</p>
                    <div className="flex gap-4 w-full max-w-xs">
                      <button 
                        type="button" 
                        onClick={() => updateMediaValue(mIdx, "", "file", "image")}
                        className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all hover:bg-gray-200"
                      >
                        📁 FILE
                      </button>
                      <button 
                        type="button" 
                        onClick={() => updateMediaValue(mIdx, "", "url", "video")}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-2xl active:scale-95 transition-all hover:bg-blue-500"
                      >
                        🔗 LINK
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-5 px-1">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${mItem.mode === 'file' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-blue-500 border-blue-500/20 bg-blue-500/10'}`}>
                        {mItem.mode === 'file' ? 'Storage Mode' : 'Network Mode'}
                       </span>
                       <button onClick={() => updateMediaValue(mIdx, "", "select", "image")} className="text-[9px] font-black text-gray-500 hover:text-white underline underline-offset-4 uppercase tracking-tighter transition-colors">Change Source</button>
                    </div>

                    {mItem.mode === "file" ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center group/img">
                        {mItem.value ? (
                          <>
                            <img src={previewUrl} className="w-full h-full object-contain" alt="preview" />
                            <div onClick={() => { setActiveMediaIndex(mIdx); setTempImage(previewUrl); setIsCropping(true); }} className="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                              <span className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase shadow-2xl transition-transform active:scale-90">Edit Image</span>
                            </div>
                          </>
                        ) : (
                          <div className="relative w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-all cursor-pointer py-12">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                updateMediaValue(mIdx, file, "file", "image");
                                setActiveMediaIndex(mIdx);
                                setTempImage(URL.createObjectURL(file));
                                setIsCropping(true);
                              }
                            }} />
                            <svg className="w-8 h-8 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest text-center">Select from device</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          placeholder="PASTE YOUTUBE URL HERE..." 
                          className="w-full bg-black border border-white/10 py-4 px-5 rounded-2xl outline-none text-xs font-bold text-blue-400 focus:border-blue-500/40 transition-all shadow-inner" 
                          value={typeof mItem.value === 'string' ? mItem.value : ""} 
                          onChange={(e) => handleUrlChange(mIdx, e.target.value)} 
                        />
                        {ytId && (
                          <div className="rounded-2xl overflow-hidden aspect-video border border-white/10 shadow-2xl relative">
                            <iframe className="w-full h-full pointer-events-none" src={`https://www.youtube.com/embed/${ytId}?rel=0&controls=0`} frameBorder="0" title="preview" />
                            <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                               <div className="bg-blue-600 px-4 py-2 rounded-lg text-[9px] font-black text-white uppercase shadow-xl">Video Preview Ready</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 🗑️ Remove Individual Media */}
                <button type="button" onClick={() => removeMedia(mIdx)} className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center transition-all opacity-0 group-hover/media:opacity-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Master Add Button */}
        <button 
          type="button" 
          onClick={addMedia} 
          className="w-full py-4.5 rounded-[1.5rem] bg-blue-600/5 border-2 border-dashed border-blue-500/20 text-blue-500 font-black uppercase text-[11px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg"
        >
          + Add New Signal Unit
        </button>
      </div>
    </div>
  );
}