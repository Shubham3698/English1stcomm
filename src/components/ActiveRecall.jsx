import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Check, RotateCcw, Loader2, Award, Volume2, Tag } from "lucide-react"; 

export default function ActiveRecall({ deck, onClose, API_URL, onPlayAudio }) {
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

  const handlePronounce = (wordToSpeak) => {
    if (onPlayAudio) {
      onPlayAudio(wordToSpeak);
    } else {
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = "en-US";
      utterance.pitch = 1.2;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
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
          {/* 🔥 FRONT CARD (TranslateZ removed for visibility fix) */}
          <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(139,0,74,0.1)] flex flex-col items-center justify-center border-2 border-white" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             
             {/* PRONOUNCE BUTTON */}
             <button 
               onClick={(e) => { e.stopPropagation(); handlePronounce(currentWord?.word); }}
               className="absolute top-5 right-5 w-12 h-12 rounded-full bg-[#FFB800] text-[#8B004A] hover:bg-[#F0AD00] transition-transform flex items-center justify-center active:scale-90 shadow-md z-50"
               title="Hear Pronunciation"
             >
               <Volume2 size={24} strokeWidth={3} />
             </button>

             <h2 className="text-5xl sm:text-6xl font-black font-heading text-[#8B004A] tracking-tight px-4 text-center mt-6 z-10">
               {currentWord?.word}
             </h2>
             
             {!isFlipped && (
               <div className="absolute bottom-10 flex flex-col items-center animate-pulse z-10">
                 <span className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-2">Tap to Reveal</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               </div>
             )}
          </div>

          {/* 🔥 BACK CARD (Tags Added, TranslateZ removed) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B004A] to-[#600033] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-white p-8 border-2 border-[#600033]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             <h3 className="text-3xl sm:text-4xl font-black mb-6 text-[#FFB800] font-heading z-10">{currentWord?.word}</h3>
             
             <div className="bg-white/10 p-5 rounded-2xl w-full text-center backdrop-blur-sm border border-white/20 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] block mb-2 opacity-80">Meaning</span>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{currentWord?.meaning}</p>
             </div>
             
             {/* 🔥 INSPIRATION TAGS SECTION */}
             <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-full z-10">
               {currentWord?.tags && currentWord.tags.length > 0 ? (
                 currentWord.tags.map((tag, idx) => (
                   <span key={idx} className="bg-white/10 text-[#FFB800] text-[12px] px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border border-[#FFB800]/40 shadow-sm backdrop-blur-md uppercase tracking-wider">
                     <Tag size={12} /> {tag}
                   </span>
                 ))
               ) : (
                 <span className="text-white/30 text-[10px] border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest font-bold">
                   No Tags Found
                 </span>
               )}
             </div>
             
             {currentWord?.partOfSpeech && (
               <span className="mt-5 bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10 z-10">{currentWord.partOfSpeech}</span>
             )}
          </div>
        </motion.div>
      </div>

      <div className="mt-6 mb-4 max-w-md mx-auto w-full flex justify-center items-center relative z-10">
        <AnimatePresence>
          {isFlipped && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="grid grid-cols-2 gap-3 w-full">
              <button disabled={isUpdating} onClick={() => handleRating('again')} className="w-full bg-white text-rose-500 py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-rose-200 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <RotateCcw size={20} strokeWidth={2.5}/>} Forgot
              </button>
              <button disabled={isUpdating} onClick={() => handleRating('hard')} className="w-full bg-white text-[#FFB800] py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-[#FFB800]/30 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <Brain size={20} strokeWidth={2.5}/>} Hard
              </button>
              <button disabled={isUpdating} onClick={() => handleRating('easy')} className="w-full bg-[#8B004A] text-white py-3 rounded-2xl font-black text-sm shadow-md border-b-4 border-[#600033] flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50">
                {isUpdating ? <Loader2 className="animate-spin text-white" size={20}/> : <Check size={20} strokeWidth={2.5}/>} Got It
              </button>
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