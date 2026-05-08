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
    <div className="space-y-4 p-5 bg-gray-50 rounded-[3rem] border border-gray-100 relative shadow-inner">
      {/* --- Delete Card Button --- */}
      <button 
        type="button" 
        onClick={() => removeVocabSlot(vIdx)} 
        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-md z-10 flex items-center justify-center font-bold"
      >
        ✕
      </button>
      
      {/* --- Text Content Section --- */}
      <div className="space-y-2">
        {/* 🔥 Word Input with Auto-Translate Logic 🔥 */}
        <input 
          type="text" 
          placeholder="WORD" 
          value={vItem.word} 
          className="w-full bg-transparent outline-none border-b-2 border-gray-200 py-1 font-black uppercase italic text-sm" 
          onChange={e => updateVocabValue(vIdx, "word", e.target.value)} 
          onBlur={() => handleAutoTranslate(vItem.word, vIdx)} 
        />
        
        {/* Hindi Meaning Input */}
        <input 
          type="text" 
          placeholder="HINDI MEANING" 
          value={vItem.meaning} 
          className="w-full bg-transparent outline-none text-xs font-bold text-red-500 italic" 
          onChange={e => updateVocabValue(vIdx, "meaning", e.target.value)} 
        />
        
        {/* Loading Indicator for AI Translation */}
        {translating === vIdx && (
          <p className="text-[8px] text-blue-500 animate-pulse font-black uppercase tracking-tighter">✨ AI Translating...</p>
        )}
        
        {/* Practice Sentence Area */}
        <textarea 
          placeholder="SENTENCE (Auto-scans from image)" 
          value={vItem.sentence} 
          className="w-full bg-white rounded-2xl p-4 text-[10px] font-bold mt-2 outline-none border-none shadow-sm h-20 resize-none leading-relaxed"
          onChange={e => updateVocabValue(vIdx, "sentence", e.target.value)} 
        />
      </div>

      {/* --- Media Section --- */}
      <div className="space-y-3">
        {mediaItems.filter(m => m.vocabIndex === vIdx).map((mItem) => {
          const actualIdx = mediaItems.findIndex(m => m === mItem);
          const ytId = mItem.mode === "url" ? getYTId(mItem.value) : null;
          
          // --- Preview Logic (Handles Blob for New Files and URL for Edits) ---
          const getPreviewUrl = () => {
            if (!mItem.value) return null;
            return mItem.value instanceof File ? URL.createObjectURL(mItem.value) : mItem.value;
          };
          const previewUrl = getPreviewUrl();

          return (
            <div key={actualIdx} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              {/* Individual Media Close Button */}
              <button 
                type="button" 
                onClick={() => setMediaItems(mediaItems.filter((_, i) => i !== actualIdx))} 
                className="absolute top-2 right-2 text-gray-300 hover:text-red-500 z-20"
              >
                ✕
              </button>
              
              {/* Toggle: FILE vs YT LINK */}
              <div className="flex gap-2 mb-3">
                <button 
                  type="button" 
                  onClick={() => updateMediaValue(actualIdx, mItem.value, "file")} 
                  className={`flex-1 py-1.5 rounded-lg text-[7px] font-black ${mItem.mode === 'file' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                >
                  FILE
                </button>
                <button 
                  type="button" 
                  onClick={() => updateMediaValue(actualIdx, mItem.value, "url")} 
                  className={`flex-1 py-1.5 rounded-lg text-[7px] font-black ${mItem.mode === 'url' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                >
                  YT LINK
                </button>
              </div>
              
              {mItem.mode === "file" ? (
                <div className="space-y-2">
                  <input 
                    type="file" 
                    className="text-[8px] w-full" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        updateMediaValue(actualIdx, file, "file");
                        setActiveMediaIndex(actualIdx);
                        setTempImage(URL.createObjectURL(file));
                        setIsCropping(true);
                      }
                    }} 
                  />
                  
                  {/* RESTORED: Image Preview and Edit Button */}
                  {mItem.value && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mt-2 shadow-inner group">
                      <img 
                        src={previewUrl} 
                        className="w-full h-36 object-contain p-1" 
                        alt="Media Preview"
                      />
                      <button 
                        type="button" 
                        onClick={() => { 
                          setActiveMediaIndex(actualIdx); 
                          setTempImage(previewUrl); 
                          setIsCropping(true); 
                        }} 
                        className="absolute inset-x-0 bottom-0 py-3 bg-black/70 text-white text-[9px] font-black uppercase backdrop-blur-sm"
                      >
                        Edit & Scan Text 🎨
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* YouTube Preview Mode */
                <div className="space-y-2">
                  <input 
                    type="text" 
                    placeholder="Paste YouTube Link..." 
                    className="w-full text-[10px] font-bold border-b border-gray-100 py-2 outline-none" 
                    value={mItem.value || ""} 
                    onChange={(e) => updateMediaValue(actualIdx, e.target.value, "url")} 
                  />
                  {ytId && (
                    <div className="rounded-xl overflow-hidden shadow-sm mt-2 aspect-video">
                      <iframe 
                        className="w-full h-full" 
                        src={`https://www.youtube.com/embed/${ytId}?rel=0`} 
                        frameBorder="0" 
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Media Placeholder */}
        <button 
          type="button" 
          onClick={addMedia} 
          className="w-full bg-white py-4 rounded-[1.5rem] text-[8px] font-black uppercase border-2 border-dashed border-gray-100 text-gray-400 hover:border-black hover:text-black transition-all"
        >
          + Add Photo / Video
        </button>
      </div>
    </div>
  );
}