import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Image as ImageIcon, ArrowLeft, Layers, Sparkles, BookOpen, Volume2, Brain, Check, RotateCcw, Loader2, Award } from "lucide-react";

export default function ViewStack({ history, onClose, onLoadWord, onPlayAudio, API_URL, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [flippedCards, setFlippedCards] = useState({});
  const [isRecallActive, setIsRecallActive] = useState(false);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter history based on search query
  const filteredHistory = history.filter((item) =>
    item.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter cards due for Spaced Repetition (SRS) review
  const dueCards = history.filter(item => {
    if (!item.srsData || !item.srsData.nextReviewDate) return true; // Include new words immediately
    return new Date(item.srsData.nextReviewDate) <= new Date();
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-[#F2EFE7] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col font-body w-full min-h-screen selection:bg-[#E01A76]/20 selection:text-[#8B004A]"
    >
      {/* INJECTED CSS FOR FLIP ANIMATION */}
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

      {/* VIBRANT BACKGROUND ORBS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* STICKY GLASS HEADER */}
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

      {/* SPEED REPS LAUNCHER BAR */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 mt-6 z-10 relative">
        <button 
          onClick={() => setIsRecallActive(true)}
          disabled={dueCards.length === 0}
          className="w-full bg-gradient-to-r from-[#E01A76] to-[#8B004A] text-white py-4 rounded-[1.5rem] font-black font-heading text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale transition-all border-b-4 border-[#600033] active:border-b-0 active:translate-y-1"
        >
          <Brain size={24} strokeWidth={2.5} /> 
          {dueCards.length > 0 
            ? `Start Speed Reps (${dueCards.length} Due)` 
            : "No Words Due - You're All Caught Up! 🎉"}
        </button>
      </div>

      {/* GRID CONTENT AREA */}
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
                    <div className="flex gap-2.5 w-full mb-2" style={{ height: '130px' }}>
                      {coverImage ? (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] overflow-hidden shrink-0 shadow-sm border border-white bg-gray-50 relative pointer-events-none">
                          <img src={coverImage} alt={item.word} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] shrink-0 border border-white bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center shadow-inner pointer-events-none">
                          <ImageIcon size={28} className="text-gray-300" strokeWidth={2.5}/>
                        </div>
                      )}

                      <div 
                        className="flip-card flex-1 cursor-pointer rounded-[1.2rem] overflow-hidden shadow-sm border border-white" 
                        onClick={() => toggleFlip(item._id)}
                      >
                        <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                          <div className="flip-card-front absolute w-full h-full bg-white/90 backdrop-blur-xl p-3 flex flex-col justify-center transition-colors">
                            <div className="flex justify-between items-start gap-1 mb-2">
                              <span className="font-heading font-black text-[#8B004A] text-[18px] sm:text-[20px] leading-tight truncate tracking-tight flex-1 pt-0.5">
                                {item.word}
                              </span>
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

      {/* EMBEDDED SPEED REPS ACTIVE RECALL MODAL */}
      <AnimatePresence>
        {isRecallActive && (
          <ActiveRecallModal 
            deck={dueCards} 
            onClose={() => {
              setIsRecallActive(false);
              if (onRefresh) onRefresh(); 
            }} 
            API_URL={API_URL} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Internal Active Recall Component for Speed Reps
function ActiveRecallModal({ deck, onClose, API_URL }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentWord = deck[currentIndex];
  const isComplete = currentIndex >= deck.length;

  const handleRating = async (rating) => {
    if (!currentWord || isUpdating) return;
    setIsUpdating(true);

    try {
      await fetch(`${API_URL}/api/words/srs-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: currentWord._id, rating })
      });
    } catch (err) {
      console.error("Failed to update SRS", err);
    } finally {
      setIsUpdating(false);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  if (isComplete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#8B004A] flex flex-col items-center justify-center text-white p-6">
        <Brain size={80} className="mb-6 text-[#FFB800] animate-bounce" strokeWidth={2} />
        <h2 className="text-4xl sm:text-5xl font-black font-heading text-center">Deck Cleared!</h2>
        <p className="font-bold mt-4 text-white/80 text-lg text-center max-w-sm">Great active recall session. Your brain is getting stronger.</p>
        <button onClick={onClose} className="mt-10 bg-white text-[#8B004A] px-10 py-4 rounded-full font-black text-lg shadow-xl active:scale-95 transition-transform">
          Back to Stack
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-[200] bg-[#F2EFE7] flex flex-col pt-12 pb-6 px-4 font-body selection:bg-[#E01A76]/20 selection:text-[#8B004A]">
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#E01A76]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-10 max-w-md mx-auto w-full relative z-10">
        <span className="bg-white text-[#8B004A] font-black px-5 py-2 rounded-full text-sm shadow-sm border border-gray-100 flex items-center gap-2">
          <Brain size={16} className="text-[#FFB800]" /> {currentIndex + 1} / {deck.length}
        </span>
        <button onClick={onClose} className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-90 border border-gray-100">
          <X size={24} strokeWidth={2.5}/>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10" style={{ perspective: 1000 }}>
        <motion.div 
          onClick={() => !isUpdating && setIsFlipped(true)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full aspect-[3/4] relative preserve-3d cursor-pointer"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(139,0,74,0.1)] flex flex-col items-center justify-center backface-hidden border-2 border-white" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             <h2 className="text-5xl sm:text-6xl font-black font-heading text-[#8B004A] tracking-tight px-4 text-center">{currentWord?.word}</h2>
             
             {!isFlipped && (
               <div className="absolute bottom-10 flex flex-col items-center animate-pulse">
                 <span className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-2">Tap to Reveal</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               </div>
             )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-[#8B004A] to-[#600033] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center backface-hidden text-white p-8 border-2 border-[#600033]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             <h3 className="text-3xl sm:text-4xl font-black mb-6 text-[#FFB800] font-heading">{currentWord?.word}</h3>
             
             <div className="bg-white/10 p-5 rounded-2xl w-full text-center backdrop-blur-sm border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] block mb-2 opacity-80">Meaning</span>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{currentWord?.meaning}</p>
             </div>
             
             {currentWord?.partOfSpeech && (
               <span className="mt-6 bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">{currentWord.partOfSpeech}</span>
             )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons (2x2 Grid for 4 Options) */}
      <div className="mt-6 max-w-md mx-auto w-full relative z-10">
        <AnimatePresence>
          {isFlipped && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="grid grid-cols-2 gap-3 w-full">
              
              {/* Button 1: Forgot */}
              <button disabled={isUpdating} onClick={() => handleRating('again')} className="w-full bg-white text-rose-500 py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-rose-200 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <RotateCcw size={20} strokeWidth={2.5}/>} Forgot
              </button>
              
              {/* Button 2: Hard */}
              <button disabled={isUpdating} onClick={() => handleRating('hard')} className="w-full bg-white text-[#FFB800] py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-[#FFB800]/30 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <Brain size={20} strokeWidth={2.5}/>} Hard
              </button>
              
              {/* Button 3: Got It */}
              <button disabled={isUpdating} onClick={() => handleRating('easy')} className="w-full bg-[#8B004A] text-white py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-[#600033] flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin text-white" size={20}/> : <Check size={20} strokeWidth={2.5}/>} Got It
              </button>

              {/* 🔥 Button 4: Mastered (No SRS needed) */}
              <button disabled={isUpdating} onClick={() => handleRating('mastered')} className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-emerald-700 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin text-white" size={20}/> : <Award size={20} strokeWidth={2.5}/>} I Know This
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}