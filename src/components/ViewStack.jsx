import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Image as ImageIcon, ArrowLeft, Layers, Sparkles, BookOpen, Volume2 } from "lucide-react";

export default function ViewStack({ history, onClose, onLoadWord, onPlayAudio }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter history based on the search query
  const filteredHistory = history.filter((item) =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-[#F2EFE7] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col font-body w-full min-h-screen selection:bg-[#E01A76]/20 selection:text-[#8B004A]"
    >
      {/* 🔥 INJECTED CSS FOR FLIP ANIMATION 🔥 */}
      <style>
        {`
          .flip-card { perspective: 1000px; }
          .flip-card-inner { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .flip-card-flipped { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back { 
            backface-visibility: hidden; 
            -webkit-backface-visibility: hidden; 
          }
          .flip-card-back { transform: rotateY(180deg); }
        `}
      </style>

      {/* --- VIBRANT BACKGROUND ORBS --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- STICKY GLASS HEADER --- */}
      <div className="sticky top-0 z-50 bg-[#F2EFE7]/80 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_30px_rgba(139,0,74,0.03)] pt-6 pb-4 px-4 sm:px-8">
        <div className="w-full max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-[#8B004A] hover:bg-[#FFB800]/10 hover:shadow-md transition-all active:scale-90 border border-transparent hover:border-[#FFB800]/30"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#8B004A] tracking-tight flex items-center gap-2">
                <Layers size={24} className="text-[#E01A76]" strokeWidth={3}/> Your Stack
              </h2>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                {filteredHistory.length} {filteredHistory.length === 1 ? 'Word' : 'Words'}
              </span>
            </div>
            <div className="w-12"></div>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-[-4px] bg-gradient-to-r from-[#E01A76] via-[#FFB800] to-[#8B004A] rounded-[2rem] blur-lg opacity-20 group-focus-within:opacity-50 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative bg-white/90 backdrop-blur-xl flex items-center p-1.5 rounded-[2rem] transition-all box-border border-2 border-white group-focus-within:border-[#E01A76]/30 shadow-sm">
              <div className="pl-5 pr-2 text-gray-400 group-focus-within:text-[#E01A76] transition-colors">
                <Search size={22} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Search your collected words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none py-3.5 text-[17px] font-heading font-black text-gray-900 placeholder:text-gray-400 truncate w-full"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="pr-4 text-gray-400 hover:text-[#8B004A] transition-colors active:scale-90"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- GRID CONTENT AREA --- */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 relative z-10 flex flex-col flex-1">
        
        {filteredHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 glass-ultra rounded-[2.5rem] mt-8 border border-white shadow-sm"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
              <ImageIcon size={32} className="text-gray-300" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-black font-heading text-gray-900 tracking-tight mb-2">
              {history.length === 0 ? "Stack is Empty" : "No Matches Found"}
            </h3>
            <p className="text-gray-500 font-bold text-[15px] text-center max-w-sm">
              {history.length === 0 
                ? "Start analyzing words to build your personal vocabulary stack." 
                : `We couldn't find anything matching "${searchQuery}".`}
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
            <AnimatePresence>
              {filteredHistory.map((item) => {
                const coverImage = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : item.imageUrl;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
                    key={item._id} 
                    className="flex flex-col p-2.5 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white shadow-[0_4px_20px_rgba(139,0,74,0.04)] hover:shadow-[0_8px_30px_rgba(139,0,74,0.08)] transition-all group"
                  >
                    
                    {/* --- STATIC CONTAINER FOR IMAGE & FLIPPING STRIP --- */}
                    <div className="flex gap-2.5 w-full mb-2" style={{ height: '130px' }}>
                      
                      {/* 1. STATIC IMAGE (LEFT SIDE) */}
                      {coverImage ? (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] overflow-hidden shrink-0 shadow-sm border border-white bg-gray-50 relative pointer-events-none">
                          <img src={coverImage} alt={item.word} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] shrink-0 border border-white bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center shadow-inner pointer-events-none">
                          <ImageIcon size={28} className="text-gray-300" strokeWidth={2.5}/>
                        </div>
                      )}

                      {/* 2. FLIPPING STRIP / PATTI (RIGHT SIDE) */}
                      <div 
                        className="flip-card flex-1 cursor-pointer rounded-[1.2rem] overflow-hidden shadow-sm border border-white" 
                        onClick={() => toggleFlip(item._id)}
                      >
                        <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                          
                          {/* FRONT OF STRIP */}
                          <div className="flip-card-front absolute w-full h-full bg-white/90 backdrop-blur-xl p-3 flex flex-col justify-center transition-colors">
                            
                            {/* 🔥 WORD & PRONUNCIATION BUTTON 🔥 */}
                            <div className="flex justify-between items-start gap-1 mb-2">
                              <span className="font-heading font-black text-[#8B004A] text-[18px] sm:text-[20px] leading-tight truncate tracking-tight flex-1 pt-0.5">
                                {item.word}
                              </span>
                              
                              {/* Audio Button - 'e.stopPropagation()' is magic here! */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); 
                                  if(onPlayAudio) onPlayAudio(item.word);
                                }}
                                className="w-8 h-8 rounded-full bg-[#FFB800]/20 text-[#8B004A] hover:bg-[#FFB800] hover:text-[#8B004A] flex items-center justify-center transition-colors shadow-sm shrink-0 active:scale-90"
                                title="Pronounce Word"
                              >
                                <Volume2 size={16} strokeWidth={3} />
                              </button>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 w-max">
                              {item.partOfSpeech && (
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                  <BookOpen size={12} /> {item.partOfSpeech}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[9px] text-[#E01A76] font-extrabold tracking-widest uppercase bg-[#E01A76]/10 px-2.5 py-1 rounded-md border border-[#E01A76]/20">
                                <Sparkles size={10} /> Tap to Flip
                              </span>
                            </div>
                          </div>
                          
                          {/* BACK OF STRIP (Word + Meaning) */}
                          <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-[#8B004A] to-[#600033] text-white p-3.5 flex flex-col items-center justify-center">
                            <span className="text-[12px] font-black font-heading text-[#FFB800] uppercase tracking-widest leading-none mb-1.5 truncate w-full text-center">
                              {item.word}
                            </span>
                            <span className="text-[12.5px] text-center font-bold line-clamp-3 leading-snug font-body opacity-95">
                              {item.meaning}
                            </span>
                          </div>

                        </div>
                      </div>

                    </div>
                    
                    {/* --- LOAD TARGET BUTTON (STATIC BOTTOM) --- */}
                    <div className="w-full">
                      <button
                        onClick={() => onLoadWord(item)}
                        className="w-full h-[50px] bg-white border border-gray-100 rounded-[1.2rem] flex items-center justify-center text-gray-600 font-black font-heading text-[14px] hover:bg-gradient-to-r hover:from-[#FFB800] hover:to-[#F0AD00] hover:text-[#8B004A] hover:border-transparent transition-all shadow-sm active:scale-95 duo-btn"
                      >
                        <Search size={18} strokeWidth={3} className="mr-2 opacity-80" /> Load Target
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}