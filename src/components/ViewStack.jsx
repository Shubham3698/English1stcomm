import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, Image as ImageIcon, ArrowLeft, Layers, Sparkles, 
  BookOpen, Volume2, Brain, Check, RotateCcw, Loader2, Award, 
  CalendarDays, ChevronLeft, ChevronRight, Trash2, Tag, RefreshCcw 
} from "lucide-react";
import toast from "react-hot-toast";

export default function ViewStack({ history, onClose, onLoadWord, onPlayAudio, API_URL, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); 
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalMonth, setCurrentCalMonth] = useState(new Date()); 
  
  const [isAllTime, setIsAllTime] = useState(true); 

  const [flippedCards, setFlippedCards] = useState({});
  const [isRecallActive, setIsRecallActive] = useState(false);
  
  // Custom Delete & Reset Modal States
  const [wordToDelete, setWordToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [wordToReset, setWordToReset] = useState(null); // 🔥 NAYA STATE UI POPUP KE LIYE
  const [isResetting, setIsResetting] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 🔥 NAYA FUNCTION: Reset SRS Modal Se API Call
  const confirmResetWord = async () => {
    if (!wordToReset) return;
    const wordId = wordToReset._id;
    setIsResetting(prev => ({ ...prev, [wordId]: true }));

    try {
      const res = await fetch(`${API_URL}/api/words/srs-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId })
      });
      
      if (res.ok) {
        toast.success("Progress reset! 🔄");
        setWordToReset(null); // Modal close
        if (onRefresh) onRefresh(); 
      } else {
        toast.error("Failed to reset progress.");
      }
    } catch (err) {
      console.error("Reset Failed:", err);
      toast.error("Network error.");
    } finally {
      setIsResetting(prev => ({ ...prev, [wordId]: false }));
    }
  };

  const getFormattedDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const activityMap = useMemo(() => {
    const map = {};
    history.forEach(item => {
      if (item.createdAt) {
        const dStr = getFormattedDate(item.createdAt);
        map[dStr] = (map[dStr] || 0) + 1;
      }
    });
    return map;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (searchQuery) {
        return item.word.toLowerCase().includes(searchQuery.toLowerCase());
      }
      if (isAllTime) return true;
      if (!item.createdAt) return false;
      if (selectedDate) {
        return getFormattedDate(item.createdAt) === selectedDate;
      } 
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentCalMonth.getMonth() && 
             itemDate.getFullYear() === currentCalMonth.getFullYear();
    });
  }, [history, searchQuery, selectedDate, currentCalMonth, isAllTime]);

  const dueCards = useMemo(() => {
    return filteredHistory.filter(item => {
      if (!item.srsData || !item.srsData.nextReviewDate) return true; 
      return new Date(item.srsData.nextReviewDate) <= new Date();
    });
  }, [filteredHistory]);

  const dueBreakdown = useMemo(() => {
    let forgot = 0, hard = 0, review = 0, newCards = 0;

    dueCards.forEach(c => {
      if (!c.srsData) {
        newCards++; 
      } else if (c.srsData.interval === 0) {
        forgot++; 
      } else if (c.srsData.interval === 1) {
        hard++; 
      } else {
        review++; 
      }
    });

    return { forgot, hard, review, newCards };
  }, [dueCards]);

  const daysInMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() - 1, 1));
    setSelectedDate(""); setIsAllTime(false); 
  };
  
  const handleNextMonth = () => {
    setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 1));
    setSelectedDate(""); setIsAllTime(false); 
  };

  const openDeleteModal = (e, item) => {
    e.stopPropagation(); setWordToDelete(item);
  };

  const confirmDeleteWord = async () => {
    if (!wordToDelete) return;
    setDeletingId(wordToDelete._id);
    try {
      const response = await fetch(`${API_URL}/api/words/delete/${wordToDelete._id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success(`"${wordToDelete.word}" deleted! 🗑️`);
        setWordToDelete(null); 
        if (onRefresh) onRefresh(); 
      } else {
        toast.error("Failed to delete word.");
      }
    } catch (error) {
      toast.error("Network error while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-[#F2EFE7] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col font-body w-full min-h-screen selection:bg-[#E01A76]/20 selection:text-[#8B004A]"
    >
      <style>
        {`
          .flip-card { perspective: 1000px; }
          .flip-card-inner { transform-style: preserve-3d; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .flip-card-flipped { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
          .flip-card-back { transform: rotateY(180deg); }
        `}
      </style>

      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/20 to-[#8B004A]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#FFB800]/15 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sticky top-0 z-50 bg-[#F2EFE7]/80 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_30px_rgba(139,0,74,0.03)] pt-6 pb-4 px-4 sm:px-8">
        <div className="w-full max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-[#8B004A] hover:bg-[#FFB800]/10 hover:shadow-md transition-all active:scale-90 border border-transparent hover:border-[#FFB800]/30">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#8B004A] tracking-tight flex items-center gap-2">
                <Layers size={24} className="text-[#E01A76]" strokeWidth={3}/> Your Stack
              </h2>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                {searchQuery ? "Search Results" : isAllTime ? "All-Time View" : selectedDate ? "Daily View" : `${monthNames[currentCalMonth.getMonth()]} View`} • {filteredHistory.length} Words
              </span>
            </div>
            <button onClick={() => setShowCalendar(!showCalendar)} className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all active:scale-90 border ${showCalendar || selectedDate || !isAllTime ? 'bg-[#8B004A] text-white border-[#600033]' : 'bg-white text-gray-500 hover:text-[#8B004A] border-transparent'}`}>
              <CalendarDays size={22} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative group max-w-2xl mx-auto mb-2">
            <div className="absolute inset-[-4px] bg-gradient-to-r from-[#E01A76] via-[#FFB800] to-[#8B004A] rounded-[2rem] blur-lg opacity-20 group-focus-within:opacity-50 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative bg-white/90 backdrop-blur-xl flex items-center p-1.5 rounded-[2rem] transition-all box-border border-2 border-white group-focus-within:border-[#E01A76]/30 shadow-sm">
              <div className="pl-5 pr-2 text-gray-400 group-focus-within:text-[#E01A76] transition-colors">
                <Search size={22} strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Search globally across all months..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) { setShowCalendar(false); setIsAllTime(true); } }}
                className="flex-1 bg-transparent border-none outline-none py-3.5 text-[17px] font-heading font-black text-gray-900 placeholder:text-gray-400 truncate w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="pr-4 text-gray-400 hover:text-[#8B004A] transition-colors active:scale-90">
                  <X size={20} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showCalendar && !searchQuery && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-w-2xl mx-auto overflow-hidden">
                <div className="bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] p-4 mt-4 shadow-[0_8px_30px_rgba(139,0,74,0.06)]">
                  
                  <div className="flex justify-between items-center mb-4 px-2">
                    <button onClick={handlePrevMonth} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-90"><ChevronLeft size={20} className="text-gray-600"/></button>
                    <h3 className="font-heading font-black text-lg text-[#8B004A]">{monthNames[currentCalMonth.getMonth()]} {currentCalMonth.getFullYear()}</h3>
                    <button onClick={handleNextMonth} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-90"><ChevronRight size={20} className="text-gray-600"/></button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (<span key={i} className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{day}</span>))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (<div key={`empty-${i}`} className="aspect-square rounded-xl bg-transparent"></div>))}
                    
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `${currentCalMonth.getFullYear()}-${String(currentCalMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const count = activityMap[dateStr] || 0;
                      const isSelected = selectedDate === dateStr;

                      return (
                        <button
                          key={day}
                          onClick={() => {
                            if (isSelected) { setSelectedDate(""); setIsAllTime(true); } 
                            else { setSelectedDate(dateStr); setIsAllTime(false); setShowCalendar(false); }
                          }}
                          className={`aspect-square relative flex items-center justify-center rounded-xl font-bold text-sm transition-all active:scale-90 border-2 ${isSelected ? 'bg-[#8B004A] text-white border-[#600033] shadow-md' : count > 0 ? 'bg-white border-[#E01A76]/20 text-gray-800 hover:border-[#E01A76]/60' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-100'}`}
                        >
                          {day}
                          {count > 0 && !isSelected && (<span className="absolute -bottom-1 -right-1 bg-[#FFB800] text-[#8B004A] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">{count}</span>)}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex justify-between items-center bg-[#8B004A]/5 p-3 rounded-xl border border-[#8B004A]/10">
                    {selectedDate ? (
                      <>
                        <span className="text-[13px] font-bold text-[#8B004A]">Words on {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: {filteredHistory.length}</span>
                        <button onClick={() => { setSelectedDate(""); setIsAllTime(true); setShowCalendar(false); }} className="text-[12px] font-black text-rose-500 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-rose-100 active:scale-95">View All Time</button>
                      </>
                    ) : (
                      <>
                        <span className="text-[13px] font-bold text-[#8B004A] flex items-center gap-1.5">
                          {isAllTime ? "Total in Stack:" : `Total in ${monthNames[currentCalMonth.getMonth()]}:`} 
                          <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-[#8B004A]/20">{isAllTime ? history.length : filteredHistory.length}</span>
                        </span>
                        {!isAllTime && (
                          <button onClick={() => { setIsAllTime(true); setShowCalendar(false); }} className="text-[12px] font-black text-[#8B004A] bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 active:scale-95">View All Time</button>
                        )}
                      </>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 mt-6 z-10 relative">
        <button 
          onClick={() => setIsRecallActive(true)}
          disabled={dueCards.length === 0}
          className="w-full bg-gradient-to-r from-[#E01A76] to-[#8B004A] text-white py-4 rounded-[1.5rem] font-black font-heading text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale transition-all border-b-4 border-[#600033] active:border-b-0 active:translate-y-1"
        >
          <Brain size={24} strokeWidth={2.5} /> 
          {dueCards.length > 0 ? `Start Speed Reps (${dueCards.length} Due)` : "No Words Due - You're All Caught Up! 🎉"}
        </button>

        {dueCards.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {dueBreakdown.newCards > 0 && (
              <div className="glass-solid px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
                <Sparkles size={14} className="text-blue-500" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">New: <span className="text-blue-500 text-[12px]">{dueBreakdown.newCards}</span></span>
              </div>
            )}
            {dueBreakdown.forgot > 0 && (
              <div className="glass-solid px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
                <RotateCcw size={14} className="text-rose-500" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Forgot: <span className="text-rose-500 text-[12px]">{dueBreakdown.forgot}</span></span>
              </div>
            )}
            {dueBreakdown.hard > 0 && (
              <div className="glass-solid px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
                <Brain size={14} className="text-[#FFB800]" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Hard: <span className="text-[#FFB800] text-[12px]">{dueBreakdown.hard}</span></span>
              </div>
            )}
            {dueBreakdown.review > 0 && (
              <div className="glass-solid px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
                <Check size={14} className="text-emerald-500" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Review: <span className="text-emerald-500 text-[12px]">{dueBreakdown.review}</span></span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 relative z-10 flex flex-col flex-1">
        {filteredHistory.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-6 glass-ultra rounded-[2.5rem] mt-8 border border-white shadow-sm"
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner mb-6">
              <CalendarDays size={32} className="text-[#8B004A]/40" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-black font-heading text-gray-900 tracking-tight mb-2 text-center">
              {searchQuery ? "No Matches Found" : selectedDate ? "No Words That Day" : isAllTime ? "Stack is Empty" : `No Words in ${monthNames[currentCalMonth.getMonth()]}`}
            </h3>
            <p className="text-gray-500 font-bold text-[15px] text-center max-w-sm">
              {searchQuery 
                ? `We couldn't find anything matching "${searchQuery}".` 
                : selectedDate 
                  ? `You didn't analyze any words on ${new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.` 
                  : isAllTime 
                    ? "Start analyzing words to build your personal vocabulary stack."
                    : `You haven't searched any words in ${monthNames[currentCalMonth.getMonth()]} ${currentCalMonth.getFullYear()}.`}
            </p>
            {(!isAllTime || selectedDate) && (
              <button onClick={() => { setSelectedDate(""); setIsAllTime(true); }} className="mt-6 bg-white text-[#8B004A] px-6 py-2.5 rounded-xl border border-gray-200 font-black shadow-sm active:scale-95">
                View All Time
              </button>
            )}
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
                    {/* 🔥 OVERLAP FIX: Height badha di hai `min-h-[150px]` se taaki content na kate */}
                    <div className="flex gap-2.5 w-full mb-3 min-h-[150px]">
                      {coverImage ? (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] overflow-hidden shrink-0 shadow-sm border border-white bg-gray-50 relative pointer-events-none">
                          <img src={coverImage} alt={item.word} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-full w-28 sm:w-32 rounded-[1.2rem] shrink-0 border border-white bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center shadow-inner pointer-events-none">
                          <ImageIcon size={28} className="text-gray-300" strokeWidth={2.5}/>
                        </div>
                      )}

                      <div className="flip-card flex-1 cursor-pointer rounded-[1.2rem] overflow-hidden shadow-sm border border-white" onClick={() => toggleFlip(item._id)}>
                        <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                          
                          <div className="flip-card-front absolute w-full h-full bg-white/90 backdrop-blur-xl p-3 flex flex-col justify-center transition-colors">
                            <div className="flex justify-between items-start gap-1 mb-2">
                              <span className="font-heading font-black text-[#8B004A] text-[18px] sm:text-[20px] leading-tight truncate tracking-tight flex-1 pt-0.5">
                                {item.word}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={(e) => openDeleteModal(e, item)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-90" title="Delete Word">
                                  <Trash2 size={14} strokeWidth={2.5} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); if(onPlayAudio) onPlayAudio(item.word); }} className="w-8 h-8 rounded-full bg-[#FFB800]/20 text-[#8B004A] hover:bg-[#FFB800] hover:text-[#8B004A] flex items-center justify-center transition-colors shadow-sm shrink-0 active:scale-90" title="Pronounce Word">
                                  <Volume2 size={16} strokeWidth={3} />
                                </button>
                              </div>
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
                            
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2 overflow-hidden max-h-[22px]">
                                {item.tags.map((tag, idx) => (
                                  <span key={idx} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border border-gray-200 whitespace-nowrap">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-[#8B004A] to-[#600033] text-white p-3.5 flex flex-col items-center justify-center">
                            <span className="text-[12px] font-black font-heading text-[#FFB800] uppercase tracking-widest leading-none mb-1.5 truncate w-full text-center mt-2">{item.word}</span>
                            <span className="text-[12.5px] text-center font-bold line-clamp-4 leading-snug font-body opacity-95">{item.meaning}</span>
                          </div>

                        </div>
                      </div>
                    </div>
                    
                    {/* 🔥 RESET BUTTON ALONGSIDE LOAD TARGET 🔥 */}
                    <div className="w-full flex gap-2">
                      <button onClick={() => onLoadWord(item)} className="flex-1 h-[50px] bg-white border border-gray-100 rounded-[1.2rem] flex items-center justify-center text-gray-600 font-black font-heading text-[14px] hover:bg-gradient-to-r hover:from-[#FFB800] hover:to-[#F0AD00] hover:text-[#8B004A] hover:border-transparent transition-all shadow-sm active:scale-95 duo-btn">
                        <Search size={18} strokeWidth={3} className="mr-2 opacity-80" /> Load Target
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); setWordToReset(item); }}
                        className="w-[50px] h-[50px] bg-white border border-gray-100 rounded-[1.2rem] flex items-center justify-center text-blue-500 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm active:scale-95 duo-btn"
                        title="Reset SRS Progress"
                      >
                        <RefreshCcw size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* 🔥 BEAUTIFUL DELETE CONFIRMATION MODAL 🔥 */}
      <AnimatePresence>
        {wordToDelete && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-[#8B004A]/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setWordToDelete(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-white rounded-[2rem] p-6 max-w-[320px] w-full shadow-2xl flex flex-col items-center text-center border-2 border-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Trash2 size={30} strokeWidth={2.5} />
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900 mb-2">Delete Word?</h3>
              <p className="font-body text-[14px] font-bold text-gray-500 mb-6 leading-snug">
                Are you sure you want to remove "<span className="text-[#E01A76]">{wordToDelete.word}</span>" from your stack? This cannot be undone.
              </p>
              <div className="flex w-full gap-3">
                <button onClick={() => setWordToDelete(null)} className="flex-1 py-3.5 rounded-[1rem] bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                <button onClick={confirmDeleteWord} disabled={deletingId === wordToDelete._id} className="flex-1 py-3.5 rounded-[1rem] bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 active:scale-95 transition-all flex justify-center items-center shadow-md shadow-rose-500/30">
                  {deletingId === wordToDelete._id ? <Loader2 size={18} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 BEAUTIFUL RESET CONFIRMATION MODAL 🔥 */}
      <AnimatePresence>
        {wordToReset && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-[#8B004A]/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setWordToReset(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-white rounded-[2rem] p-6 max-w-[320px] w-full shadow-2xl flex flex-col items-center text-center border-2 border-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <RefreshCcw size={30} strokeWidth={2.5} />
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900 mb-2">Reset Progress?</h3>
              <p className="font-body text-[14px] font-bold text-gray-500 mb-6 leading-snug">
                Are you sure you want to reset your learning progress for "<span className="text-blue-500">{wordToReset.word}</span>"? It will reappear in your due cards.
              </p>
              <div className="flex w-full gap-3">
                <button onClick={() => setWordToReset(null)} className="flex-1 py-3.5 rounded-[1rem] bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                <button onClick={confirmResetWord} disabled={isResetting[wordToReset._id]} className="flex-1 py-3.5 rounded-[1rem] bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 active:scale-95 transition-all flex justify-center items-center shadow-md shadow-blue-500/30">
                  {isResetting[wordToReset._id] ? <Loader2 size={18} className="animate-spin" /> : "Reset"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE RECALL MODAL */}
      <AnimatePresence>
        {isRecallActive && (
          <ActiveRecallModal 
            deck={dueCards} 
            onClose={() => {
              setIsRecallActive(false);
              if (onRefresh) onRefresh(); 
            }} 
            API_URL={API_URL} 
            onPlayAudio={onPlayAudio}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 🔥 RESTORED 4-BUTTON ACTIVE RECALL MODAL 🔥
function ActiveRecallModal({ deck, onClose, API_URL, onPlayAudio }) {
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
          <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(139,0,74,0.1)] flex flex-col items-center justify-center border-2 border-white" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             
             <button 
               onClick={(e) => { e.stopPropagation(); handlePronounce(currentWord?.word); }}
               className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[#FFB800] text-[#8B004A] hover:bg-[#F0AD00] transition-transform flex items-center justify-center active:scale-90 shadow-md z-[60]"
               title="Hear Pronunciation"
             >
               <Volume2 size={24} strokeWidth={3} />
             </button>

             <h2 className="text-5xl sm:text-6xl font-black font-heading text-[#8B004A] tracking-tight px-4 text-center mt-6">
               {currentWord?.word}
             </h2>
             
             {!isFlipped && (
               <div className="absolute bottom-10 flex flex-col items-center animate-pulse">
                 <span className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-2">Tap to Reveal</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               </div>
             )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-[#8B004A] to-[#600033] rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-white p-8 border-2 border-[#600033]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             <h3 className="text-3xl sm:text-4xl font-black mb-6 text-[#FFB800] font-heading">{currentWord?.word}</h3>
             
             <div className="bg-white/10 p-5 rounded-2xl w-full text-center backdrop-blur-sm border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] block mb-2 opacity-80">Meaning</span>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{currentWord?.meaning}</p>
             </div>
             
             <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-full">
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
               <span className="mt-5 bg-white/20 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border border-white/10">{currentWord.partOfSpeech}</span>
             )}
          </div>
        </motion.div>
      </div>

      {/* 🔥 MASTERED BUTTON RESTORED IN 2x2 GRID 🔥 */}
      <div className="h-32 mt-6 max-w-md mx-auto w-full flex justify-center items-center relative z-10">
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