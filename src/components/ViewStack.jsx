import React, { useState, useMemo, useEffect } from "react";
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
  const [activeDeck, setActiveDeck] = useState([]);
  
  // Custom Modals States
  const [wordToDelete, setWordToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [wordToReset, setWordToReset] = useState(null); 
  const [isResetting, setIsResetting] = useState({});
  const [showBulkResetModal, setShowBulkResetModal] = useState(false);
  const [isBulkResetting, setIsBulkResetting] = useState(false);

  // PILL BUTTON TOGGLE (Highlight Borders)
  const [showSRSColors, setShowSRSColors] = useState(false);

  // SRS CATEGORY FILTER (All, New, Hard, etc.)
  const [srsFilter, setSrsFilter] = useState('all');

  // SESSION TRACKER FOR ABANDONED DECKS
  const [hasAbandonedSession, setHasAbandonedSession] = useState(false);

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // SRS STATUS HELPER FUNCTION
  const getSRSStatus = (item) => {
    if (!item.srsData || typeof item.srsData.interval === 'undefined') {
      return { id: 'new', color: 'border-blue-400', shadow: 'shadow-[0_8px_20px_rgba(59,130,246,0.25)]', label: 'New', bg: 'bg-blue-500', text: 'text-white' };
    }
    if (item.srsData.interval === 0) {
      return { id: 'forgot', color: 'border-rose-400', shadow: 'shadow-[0_8px_20px_rgba(244,63,94,0.25)]', label: 'Forgot', bg: 'bg-rose-500', text: 'text-white' };
    }
    if (item.srsData.interval === 1) {
      return { id: 'hard', color: 'border-[#FFB800]', shadow: 'shadow-[0_8px_20px_rgba(255,184,0,0.3)]', label: 'Hard', bg: 'bg-[#FFB800]', text: 'text-gray-900' };
    }
    if (item.srsData.interval > 21) {
      return { id: 'mastered', color: 'border-purple-400', shadow: 'shadow-[0_8px_20px_rgba(168,85,247,0.25)]', label: 'Mastered', bg: 'bg-purple-500', text: 'text-white' };
    }
    return { id: 'learning', color: 'border-emerald-400', shadow: 'shadow-[0_8px_20px_rgba(16,185,129,0.25)]', label: 'Learning', bg: 'bg-emerald-500', text: 'text-white' };
  };

  const confirmBulkReset = async () => {
    if (filteredHistory.length === 0) return;
    setIsBulkResetting(true);
    try {
      const wordIds = filteredHistory.map(item => item._id);
      const res = await fetch(`${API_URL}/api/words/srs-bulk-reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordIds })
      });
      if (res.ok) {
        toast.success(`${wordIds.length} words reset to default! 🔄`);
        setShowBulkResetModal(false);
        if (onRefresh) onRefresh(); 
      } else toast.error("Failed to bulk reset.");
    } catch (err) { toast.error("Network error."); } 
    finally { setIsBulkResetting(false); }
  };

  const handleResetSRS = async (e, wordId) => {
    e.stopPropagation(); 
    setIsResetting(prev => ({ ...prev, [wordId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/words/srs-reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId })
      });
      if (res.ok) {
        toast.success("Progress reset! 🔄");
        if (onRefresh) onRefresh(); 
      } else toast.error("Failed to reset progress.");
    } catch (err) { toast.error("Network error."); } 
    finally { setIsResetting(prev => ({ ...prev, [wordId]: false })); }
  };

  const confirmResetWord = async () => {
    if (!wordToReset) return;
    const wordId = wordToReset._id;
    setIsResetting(prev => ({ ...prev, [wordId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/words/srs-reset`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wordId })
      });
      if (res.ok) {
        toast.success("Progress reset! 🔄");
        setWordToReset(null); 
        if (onRefresh) onRefresh(); 
      } else toast.error("Failed to reset progress.");
    } catch (err) { toast.error("Network error."); } 
    finally { setIsResetting(prev => ({ ...prev, [wordId]: false })); }
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

  const baseFilteredHistory = useMemo(() => {
    return history.filter((item) => {
      if (searchQuery) return item.word.toLowerCase().includes(searchQuery.toLowerCase());
      if (isAllTime) return true;
      if (!item.createdAt) return false;
      if (selectedDate) return getFormattedDate(item.createdAt) === selectedDate;
      const itemDate = new Date(item.createdAt);
      return itemDate.getMonth() === currentCalMonth.getMonth() && 
             itemDate.getFullYear() === currentCalMonth.getFullYear();
    });
  }, [history, searchQuery, selectedDate, currentCalMonth, isAllTime]);

  const srsCounts = useMemo(() => {
    const counts = { new: 0, forgot: 0, hard: 0, learning: 0, mastered: 0 };
    baseFilteredHistory.forEach(item => {
      const status = getSRSStatus(item);
      if (counts[status.id] !== undefined) counts[status.id]++;
    });
    return counts;
  }, [baseFilteredHistory]);

  const filteredHistory = useMemo(() => {
    if (srsFilter === 'all') return baseFilteredHistory;
    return baseFilteredHistory.filter(item => getSRSStatus(item).id === srsFilter);
  }, [baseFilteredHistory, srsFilter]);

  const dueCards = useMemo(() => {
    return baseFilteredHistory.filter(item => {
      if (!item.srsData || !item.srsData.nextReviewDate) return true; 
      return new Date(item.srsData.nextReviewDate) <= new Date();
    });
  }, [baseFilteredHistory]);

  useEffect(() => {
    if (dueCards.length === 0) setHasAbandonedSession(false);
  }, [dueCards.length]);

  const dueBreakdown = useMemo(() => {
    const forgot = [], hard = [], review = [], newCards = [];
    dueCards.forEach(c => {
      if (!c.srsData) newCards.push(c); 
      else if (c.srsData.interval === 0) forgot.push(c); 
      else if (c.srsData.interval === 1) hard.push(c); 
      else review.push(c); 
    });
    return { forgot, hard, review, newCards };
  }, [dueCards]);

  const daysInMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => { setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() - 1, 1)); setSelectedDate(""); setIsAllTime(false); setSrsFilter('all'); };
  const handleNextMonth = () => { setCurrentCalMonth(new Date(currentCalMonth.getFullYear(), currentCalMonth.getMonth() + 1, 1)); setSelectedDate(""); setIsAllTime(false); setSrsFilter('all'); };

  const confirmDeleteWord = async () => {
    if (!wordToDelete) return;
    setDeletingId(wordToDelete._id);
    try {
      const response = await fetch(`${API_URL}/api/words/delete/${wordToDelete._id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success(`"${wordToDelete.word}" deleted! 🗑️`);
        setWordToDelete(null); 
        if (onRefresh) onRefresh(); 
      } else toast.error("Failed to delete word.");
    } catch (error) { toast.error("Network error."); } 
    finally { setDeletingId(null); }
  };

  const openDeleteModal = (e, item) => { e.stopPropagation(); setWordToDelete(item); };

  const handleChipClick = (deck) => {
    if (hasAbandonedSession) {
      toast("Finish your pending Speed Reps deck first!", {
        icon: '⚠️',
        style: {
          borderRadius: '12px',
          background: '#8B004A',
          color: '#fff',
          fontWeight: 'bold'
        },
      });
      return;
    }
    setActiveDeck(deck);
    setIsRecallActive(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.96 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
      className="fixed inset-0 z-[100] bg-[#FDFBF7] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col font-body w-full min-h-screen selection:bg-[#E01A76]/20 selection:text-[#8B004A]"
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

      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#E01A76]/10 to-[#8B004A]/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#FFB800]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="sticky top-0 z-50 bg-[#FDFBF7]/85 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_30px_rgba(139,0,74,0.03)] pt-6 pb-4 px-4 sm:px-8">
        <div className="w-full max-w-4xl mx-auto">
          
          <div className="flex items-center justify-between mb-6">
            <button onClick={onClose} className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-[#8B004A] hover:bg-[#FFB800]/10 hover:shadow-md transition-all active:scale-90 border border-transparent hover:border-[#FFB800]/30">
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#8B004A] tracking-tight flex items-center gap-2 drop-shadow-sm">
                <Layers size={24} className="text-[#FFB800]" strokeWidth={3}/> Your Stack
              </h2>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                {searchQuery ? "Search Results" : isAllTime ? "All-Time View" : selectedDate ? "Daily View" : `${monthNames[currentCalMonth.getMonth()]} View`} • {baseFilteredHistory.length} Words
              </span>
            </div>
            <button onClick={() => { setShowCalendar(!showCalendar); if (!showCalendar) setIsAllTime(false); }} className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center transition-all active:scale-90 border ${showCalendar || selectedDate || !isAllTime ? 'bg-[#8B004A] text-white border-[#600033]' : 'bg-white text-gray-500 hover:text-[#8B004A] hover:bg-rose-50 border-transparent'}`}>
              <CalendarDays size={22} strokeWidth={2.5} />
            </button>
          </div>

          <div className="relative group max-w-2xl mx-auto mb-2">
            <div className="absolute inset-[-4px] bg-gradient-to-r from-[#E01A76] via-[#FFB800] to-[#8B004A] rounded-[2rem] blur-lg opacity-15 group-focus-within:opacity-40 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative bg-white/95 backdrop-blur-xl flex items-center p-1.5 rounded-[2rem] transition-all box-border border-2 border-white group-focus-within:border-[#E01A76]/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
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
                <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 mt-4 shadow-[0_10px_40px_rgba(139,0,74,0.08)]">
                  <div className="flex justify-between items-center mb-5 px-2">
                    <button onClick={handlePrevMonth} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-600"><ChevronLeft size={20} /></button>
                    <h3 className="font-heading font-black text-lg text-[#8B004A] tracking-wide">{monthNames[currentCalMonth.getMonth()]} {currentCalMonth.getFullYear()}</h3>
                    <button onClick={handleNextMonth} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-gray-600"><ChevronRight size={20} /></button>
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
                            if (isSelected) { setSelectedDate(""); setIsAllTime(false); } 
                            else { setSelectedDate(dateStr); setIsAllTime(false); setShowCalendar(false); setSrsFilter('all'); }
                          }}
                          className={`aspect-square relative flex items-center justify-center rounded-xl font-bold text-sm transition-all active:scale-90 border-2 ${isSelected ? 'bg-[#8B004A] text-white border-[#600033] shadow-md' : count > 0 ? 'bg-white border-[#E01A76]/20 text-gray-800 hover:border-[#E01A76]/60 hover:shadow-sm' : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-50'}`}
                        >
                          {day}
                          {count > 0 && !isSelected && (<span className="absolute -bottom-1 -right-1 bg-[#FFB800] text-[#8B004A] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white">{count}</span>)}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-5 flex justify-between items-center bg-[#8B004A]/5 p-3 rounded-[1rem] border border-[#8B004A]/10">
                    {selectedDate ? (
                      <>
                        <span className="text-[13px] font-bold text-[#8B004A]">Words on {new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}: {baseFilteredHistory.length}</span>
                        <button onClick={() => { setSelectedDate(""); setIsAllTime(false); }} className="text-[12px] font-black text-white bg-rose-500 hover:bg-rose-600 px-4 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all">Clear Day</button>
                      </>
                    ) : (
                      <>
                        <span className="text-[13px] font-bold text-[#8B004A] flex items-center gap-1.5">
                          {isAllTime ? "Total in Stack:" : `Total in ${monthNames[currentCalMonth.getMonth()]}:`} 
                          <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-[#8B004A]/20 text-gray-900">{isAllTime ? history.length : baseFilteredHistory.length}</span>
                        </span>
                        {!isAllTime && (
                          <button onClick={() => { setIsAllTime(true); setShowCalendar(false); setSrsFilter('all'); }} className="text-[12px] font-black text-[#8B004A] bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 active:scale-95 transition-all hover:bg-gray-50">View All Time</button>
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

      {/* LAUNCHER BAR & CHIPS */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 mt-8 z-10 relative">
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => { setActiveDeck(dueCards); setIsRecallActive(true); }}
            disabled={dueCards.length === 0}
            className="flex-1 bg-gradient-to-r from-[#8B004A] to-[#E01A76] text-white py-4 rounded-[1.5rem] font-black font-heading text-[17px] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(139,0,74,0.3)] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all border-b-4 border-[#600033] active:border-b-0 active:translate-y-1 hover:brightness-110"
          >
            <Brain size={22} strokeWidth={2.5} className="text-[#FFB800]"/> 
            {dueCards.length > 0 ? `Start Speed Reps (${dueCards.length})` : "You're All Caught Up! 🎉"}
          </button>

          {filteredHistory.length > 0 && (
            <button 
              onClick={() => setShowBulkResetModal(true)}
              className="sm:w-auto w-full bg-white text-[#8B004A] px-6 py-4 rounded-[1.5rem] font-black font-heading text-[15px] flex items-center justify-center gap-2 shadow-sm hover:bg-rose-50 transition-all active:scale-95 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1 shrink-0"
            >
              <RefreshCcw size={18} strokeWidth={3} className="text-[#E01A76]"/>
              Reset List ({filteredHistory.length})
            </button>
          )}
        </div>

        {dueCards.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            {dueBreakdown.newCards.length > 0 && (
              <button onClick={() => handleChipClick(dueBreakdown.newCards)} className="bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-[1rem] border border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-2 hover:border-blue-200 hover:shadow-md transition-all active:scale-95 group">
                <Sparkles size={14} className="text-blue-500 group-hover:scale-110 transition-transform" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">New: <span className="text-blue-500 text-[13px]">{dueBreakdown.newCards.length}</span></span>
              </button>
            )}
            {dueBreakdown.forgot.length > 0 && (
              <button onClick={() => handleChipClick(dueBreakdown.forgot)} className="bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-[1rem] border border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-2 hover:border-rose-200 hover:shadow-md transition-all active:scale-95 group">
                <RotateCcw size={14} className="text-rose-500 group-hover:-rotate-90 transition-transform" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Forgot: <span className="text-rose-500 text-[13px]">{dueBreakdown.forgot.length}</span></span>
              </button>
            )}
            {dueBreakdown.hard.length > 0 && (
              <button onClick={() => handleChipClick(dueBreakdown.hard)} className="bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-[1rem] border border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-2 hover:border-[#FFB800] hover:shadow-md transition-all active:scale-95 group">
                <Brain size={14} className="text-[#F59E0B] group-hover:scale-110 transition-transform" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Hard: <span className="text-[#F59E0B] text-[13px]">{dueBreakdown.hard.length}</span></span>
              </button>
            )}
            {dueBreakdown.review.length > 0 && (
              <button onClick={() => handleChipClick(dueBreakdown.review)} className="bg-white/90 backdrop-blur-sm px-3.5 py-2 rounded-[1rem] border border-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-2 hover:border-emerald-200 hover:shadow-md transition-all active:scale-95 group">
                <Check size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" strokeWidth={3}/>
                <span className="text-[11px] font-black text-gray-700 font-heading uppercase tracking-widest">Review: <span className="text-emerald-500 text-[13px]">{dueBreakdown.review.length}</span></span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 relative z-10 flex flex-col flex-1">
        
        {/* HIGHLIGHT TOGGLE & SRS CATEGORY FILTERS */}
        {baseFilteredHistory.length > 0 && (
          <div className="w-full flex flex-col gap-3 mb-6 px-1">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-gray-800 text-[18px]">Vocabulary Stack</h3>
              <div 
                onClick={() => setShowSRSColors(!showSRSColors)}
                className={`flex items-center gap-2 cursor-pointer group bg-white px-3 py-1.5 rounded-full shadow-sm border transition-all active:scale-95 ${showSRSColors ? 'border-[#8B004A]' : 'border-gray-100'}`}
                title="Highlight SRS Status Borders"
              >
                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showSRSColors ? 'text-[#8B004A]' : 'text-gray-400'}`}>
                  SRS Status
                </span>
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out relative ${showSRSColors ? 'bg-[#FFB800]' : 'bg-gray-200'}`}>
                  <motion.div 
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: showSRSColors ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
            </div>

            {/* Horizontal Filter Bar */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 w-full snap-x">
              <button onClick={() => setSrsFilter('all')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'all' ? 'bg-gray-800 text-white border-gray-900' : 'bg-white text-gray-500 border-transparent hover:border-gray-200'}`}>
                All <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{baseFilteredHistory.length}</span>
              </button>
              <button onClick={() => setSrsFilter('new')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'new' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-blue-500 border-transparent hover:border-blue-100'}`}>
                New <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'new' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-500'}`}>{srsCounts.new}</span>
              </button>
              <button onClick={() => setSrsFilter('forgot')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'forgot' ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-rose-500 border-transparent hover:border-rose-100'}`}>
                Forgot <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'forgot' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-500'}`}>{srsCounts.forgot}</span>
              </button>
              <button onClick={() => setSrsFilter('hard')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'hard' ? 'bg-[#FFB800] text-gray-900 border-[#D99A00]' : 'bg-white text-[#F59E0B] border-transparent hover:border-[#FFB800]/20'}`}>
                Hard <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'hard' ? 'bg-[#D99A00] text-white' : 'bg-[#FFB800]/10 text-[#F59E0B]'}`}>{srsCounts.hard}</span>
              </button>
              <button onClick={() => setSrsFilter('learning')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'learning' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-emerald-500 border-transparent hover:border-emerald-100'}`}>
                Learning <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'learning' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-500'}`}>{srsCounts.learning}</span>
              </button>
              <button onClick={() => setSrsFilter('mastered')} className={`snap-start shrink-0 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-sm border-2 ${srsFilter === 'mastered' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-purple-500 border-transparent hover:border-purple-100'}`}>
                Mastered <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${srsFilter === 'mastered' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-500'}`}>{srsCounts.mastered}</span>
              </button>
            </div>
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 px-6 bg-white/70 backdrop-blur-lg rounded-[2.5rem] mt-4 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-[#FFB800]/10 rounded-full flex items-center justify-center shadow-inner mb-6">
              <CalendarDays size={32} className="text-[#FFB800]" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-black font-heading text-[#8B004A] tracking-tight mb-2 text-center">
              {searchQuery ? "No Matches Found" : srsFilter !== 'all' ? `No ${srsFilter.charAt(0).toUpperCase() + srsFilter.slice(1)} Words Found` : selectedDate ? "No Words That Day" : isAllTime ? "Stack is Empty" : `No Words in ${monthNames[currentCalMonth.getMonth()]}`}
            </h3>
            <p className="text-gray-500 font-bold text-[15px] text-center max-w-sm">
              {srsFilter !== 'all' && !searchQuery ? `You don't have any words in the '${srsFilter}' category for this period.` : ""}
            </p>
            {(srsFilter !== 'all' || !isAllTime || selectedDate) && (
              <button onClick={() => { setSelectedDate(""); setIsAllTime(true); setSrsFilter('all'); }} className="mt-8 bg-[#8B004A] text-white px-8 py-3.5 rounded-[1.2rem] font-black shadow-lg hover:bg-[#600033] active:scale-95 transition-all">
                View All Time
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            <AnimatePresence>
              {filteredHistory.map((item) => {
                const coverImage = (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : item.imageUrl;
                const srsStatus = getSRSStatus(item); 

                return (
                  <motion.div 
                    layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.25, type: "spring", bounce: 0.3 }} key={item._id} 
                    className={`flex flex-col p-3 bg-white/90 backdrop-blur-xl rounded-[2.5rem] relative transition-all group ${
                      showSRSColors 
                        ? `border-[3px] ${srsStatus.color} ${srsStatus.shadow}` 
                        : `border-2 border-white shadow-[0_10px_40px_rgba(139,0,74,0.06)] hover:shadow-[0_15px_50px_rgba(139,0,74,0.12)]`
                    }`}
                  >
                    {/* HIGHLIGHT BADGE OVER CARD */}
                    <AnimatePresence>
                      {showSRSColors && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          className={`absolute -top-3 -right-2 z-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-md ${srsStatus.bg} ${srsStatus.text}`}
                        >
                          {srsStatus.label}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 w-full mb-3 min-h-[140px]">
                      {coverImage ? (
                        <div className="h-full w-28 sm:w-[110px] rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm border-2 border-white bg-gray-50 relative pointer-events-none">
                          <img src={coverImage} alt={item.word} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-full w-28 sm:w-[110px] rounded-[1.5rem] shrink-0 border-2 border-white bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center shadow-inner pointer-events-none">
                          <ImageIcon size={28} className="text-gray-300" strokeWidth={2.5}/>
                        </div>
                      )}

                      <div className="flip-card flex-1 cursor-pointer rounded-[1.5rem] overflow-hidden shadow-sm border-2 border-white" onClick={() => toggleFlip(item._id)}>
                        <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id] ? 'flip-card-flipped' : ''}`}>
                          
                          <div className="flip-card-front absolute w-full h-full bg-white p-3.5 flex flex-col justify-center transition-colors">
                            <div className="flex justify-between items-start gap-1 mb-2">
                              <span className="font-heading font-black text-[#8B004A] text-[22px] leading-tight truncate tracking-tight flex-1 pt-0.5">{item.word}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); if(onPlayAudio) onPlayAudio(item.word); }} className="w-9 h-9 rounded-full bg-[#FFB800] text-[#8B004A] hover:bg-[#F59E0B] flex items-center justify-center transition-colors shadow-md shrink-0 active:scale-90" title="Pronounce Word">
                                  <Volume2 size={18} strokeWidth={2.5} />
                                </button>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1.5 w-max">
                              {item.partOfSpeech && (<span className="text-[10px] font-black text-[#E01A76] uppercase tracking-widest flex items-center gap-1 bg-[#E01A76]/10 px-2.5 py-0.5 rounded-lg border border-[#E01A76]/20">{item.partOfSpeech}</span>)}
                              <span className="flex items-center gap-1 text-[9px] text-gray-400 font-extrabold tracking-widest uppercase mt-1"><Sparkles size={10} className="text-[#FFB800]" /> Tap to Flip</span>
                            </div>
                          </div>
                          
                          <div className="flip-card-back absolute w-full h-full bg-gradient-to-br from-[#8B004A] to-[#4A0027] text-white p-4 flex flex-col items-center justify-center">
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              <button onClick={(e) => { e.stopPropagation(); setWordToReset(item); }} disabled={isResetting[item._id]} className="w-7 h-7 bg-white/10 hover:bg-[#FFB800] hover:text-[#8B004A] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm" title="Reset Progress">
                                {isResetting[item._id] ? <Loader2 size={12} className="animate-spin text-white"/> : <RefreshCcw size={12} />}
                              </button>
                              <button onClick={(e) => openDeleteModal(e, item)} className="w-7 h-7 bg-white/10 hover:bg-rose-500 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm" title="Delete Word">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <span className="text-[13px] font-black font-heading text-[#FFB800] uppercase tracking-widest leading-none mb-2 truncate w-full text-center mt-2 drop-shadow-sm">{item.word}</span>
                            <span className="text-[13px] text-center font-bold line-clamp-3 leading-snug font-body opacity-95">{item.meaning}</span>
                          </div>

                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <button onClick={() => onLoadWord(item)} className="w-full h-[54px] bg-gray-50 border-2 border-white rounded-[1.2rem] flex items-center justify-center text-[#8B004A] font-black font-heading text-[15px] hover:bg-white hover:border-[#8B004A]/20 hover:shadow-md transition-all active:scale-95">
                        <Search size={18} strokeWidth={3} className="mr-2 text-[#E01A76]" /> Load Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {showBulkResetModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-[#8B004A]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBulkResetModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", bounce: 0.4 }} className="bg-white rounded-[2rem] p-7 max-w-[340px] w-full shadow-2xl flex flex-col items-center text-center border-4 border-white" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-[#FFB800]/20 text-[#D99A00] rounded-full flex items-center justify-center mb-5 shadow-inner"><RefreshCcw size={30} strokeWidth={2.5} /></div>
              <h3 className="font-heading font-black text-xl text-[#8B004A] mb-2">Reset {filteredHistory.length} Words?</h3>
              <p className="font-body text-[14px] font-bold text-gray-500 mb-6 leading-relaxed">This will reset the learning progress for ALL <span className="text-[#E01A76]">{filteredHistory.length} words</span> currently displayed.</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setShowBulkResetModal(false)} className="flex-1 py-3.5 rounded-[1.2rem] bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                <button onClick={confirmBulkReset} disabled={isBulkResetting} className="flex-1 py-3.5 rounded-[1.2rem] bg-[#8B004A] text-white font-bold text-sm hover:bg-[#600033] active:scale-95 transition-all flex justify-center items-center shadow-lg">{isBulkResetting ? <Loader2 size={18} className="animate-spin" /> : "Reset All"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wordToDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-[#8B004A]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setWordToDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", bounce: 0.4 }} className="bg-white rounded-[2rem] p-7 max-w-[340px] w-full shadow-2xl flex flex-col items-center text-center border-4 border-white" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-5 shadow-inner"><Trash2 size={30} strokeWidth={2.5} /></div>
              <h3 className="font-heading font-black text-xl text-[#8B004A] mb-2">Delete Word?</h3>
              <p className="font-body text-[14px] font-bold text-gray-500 mb-6 leading-relaxed">Remove "<span className="text-[#E01A76]">{wordToDelete.word}</span>" from your stack?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setWordToDelete(null)} className="flex-1 py-3.5 rounded-[1.2rem] bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                <button onClick={confirmDeleteWord} disabled={deletingId === wordToDelete._id} className="flex-1 py-3.5 rounded-[1.2rem] bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 active:scale-95 transition-all flex justify-center items-center shadow-lg shadow-rose-500/30">{deletingId === wordToDelete._id ? <Loader2 size={18} className="animate-spin" /> : "Delete"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wordToReset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-[#8B004A]/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setWordToReset(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", bounce: 0.4 }} className="bg-white rounded-[2rem] p-7 max-w-[340px] w-full shadow-2xl flex flex-col items-center text-center border-4 border-white" onClick={e => e.stopPropagation()}>
              <div className="w-16 h-16 bg-[#FFB800]/20 text-[#D99A00] rounded-full flex items-center justify-center mb-5 shadow-inner"><RefreshCcw size={30} strokeWidth={2.5} /></div>
              <h3 className="font-heading font-black text-xl text-[#8B004A] mb-2">Reset Progress?</h3>
              <p className="font-body text-[14px] font-bold text-gray-500 mb-6 leading-relaxed">Reset learning progress for "<span className="text-[#E01A76]">{wordToReset.word}</span>"?</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setWordToReset(null)} className="flex-1 py-3.5 rounded-[1.2rem] bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 active:scale-95 transition-all">Cancel</button>
                <button onClick={confirmResetWord} disabled={isResetting[wordToReset._id]} className="flex-1 py-3.5 rounded-[1.2rem] bg-[#8B004A] text-white font-bold text-sm hover:bg-[#600033] active:scale-95 transition-all flex justify-center items-center shadow-lg">{isResetting[wordToReset._id] ? <Loader2 size={18} className="animate-spin" /> : "Reset"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecallActive && (
          <ActiveRecallModal 
            deck={activeDeck} 
            onClose={(completed) => { 
              setIsRecallActive(false); 
              setActiveDeck([]); 
              if (!completed) setHasAbandonedSession(true);
              else setHasAbandonedSession(false);
              if (onRefresh) onRefresh(); 
            }} 
            API_URL={API_URL} 
            onPlayAudio={onPlayAudio} 
            onLoadWord={onLoadWord} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// 🔥 ACTIVE RECALL MODAL COMPONENT 🔥
function ActiveRecallModal({ deck, onClose, API_URL, onPlayAudio, onLoadWord }) {
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

  // NAYA FUNCTION: Seedha Detail page par le jane ke liye
  const handleLoadDetails = (e) => {
    e.stopPropagation();
    onClose(false); 
    setTimeout(() => {
      onLoadWord(currentWord); 
    }, 200); 
  };

  if (isComplete) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#8B004A] flex flex-col items-center justify-center text-white p-6">
        <Award size={100} className="mb-6 text-[#FFB800] drop-shadow-lg" strokeWidth={2} />
        <h2 className="text-4xl sm:text-5xl font-black font-heading text-center text-white drop-shadow-md">Deck Cleared!</h2>
        <p className="font-bold mt-4 text-white/80 text-lg text-center max-w-sm">Great active recall session. Your brain is getting stronger.</p>
        <button onClick={() => onClose(true)} className="mt-10 bg-white text-[#8B004A] px-10 py-4 rounded-full font-black text-lg shadow-xl active:scale-95 transition-transform hover:bg-gray-50">
          Back to Stack
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-0 z-[200] bg-[#F2EFE7] flex flex-col pt-12 pb-6 px-4 font-body selection:bg-[#E01A76]/20 selection:text-[#8B004A]">
      
      {/* MAGENTA BACKGROUND ORB */}
      <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#E01A76]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-10 max-w-md mx-auto w-full relative z-10">
        <span className="bg-white text-[#8B004A] font-black px-5 py-2 rounded-full text-sm shadow-sm border border-gray-100 flex items-center gap-2">
          <Brain size={16} className="text-[#FFB800]" /> {currentIndex + 1} / {deck.length}
        </span>
        <button onClick={() => onClose(false)} className="p-3 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors active:scale-90 border border-gray-100">
          <X size={24} strokeWidth={2.5}/>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative z-10" style={{ perspective: 1000 }}>
        <motion.div 
          onClick={() => { if (!isUpdating && !isFlipped) setIsFlipped(true); }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }} // 🔥 YAHAN FIX KIYA HAI: TWEEN TRANSITION 🔥
          className={`w-full aspect-[3/4] relative preserve-3d ${!isFlipped ? 'cursor-pointer hover:scale-[1.02]' : ''} transition-transform`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT CARD */}
          <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(139,0,74,0.12)] flex flex-col items-center justify-center border-2 border-white" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             
             {/* PRONOUNCE BUTTON */}
             <button 
               onClick={(e) => { e.stopPropagation(); handlePronounce(currentWord?.word); }}
               className="absolute top-5 right-5 w-12 h-12 rounded-full bg-[#FFB800] text-[#8B004A] hover:bg-[#F0AD00] transition-transform flex items-center justify-center active:scale-90 shadow-md z-50"
               title="Hear Pronunciation"
             >
               <Volume2 size={24} strokeWidth={3} />
             </button>

             <h2 className="text-5xl sm:text-6xl font-black font-heading text-[#8B004A] tracking-tight px-4 text-center mt-6 z-10 drop-shadow-sm">
               {currentWord?.word}
             </h2>
             
             {!isFlipped && (
               <div className="absolute bottom-10 flex flex-col items-center animate-pulse z-10">
                 <span className="text-gray-400 font-bold text-sm tracking-widest uppercase mb-2">Tap to Reveal</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
               </div>
             )}
          </div>

          {/* BACK CARD */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B004A] to-[#600033] rounded-[2.5rem] shadow-[0_20px_50px_rgba(139,0,74,0.3)] flex flex-col items-center justify-center text-white p-8 border-2 border-[#600033]" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
             
             {/* FLIP BACK BUTTON (Top Left) */}
             <button 
               onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
               className="absolute top-5 left-5 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center active:scale-90 shadow-sm z-50 border border-white/10"
               title="Flip Back to Word"
             >
               <RotateCcw size={22} strokeWidth={2.5} />
             </button>

             {/* LOAD DETAILS BUTTON (Top Right) */}
             <button 
               onClick={handleLoadDetails}
               className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-[#FFB800] hover:text-[#8B004A] transition-all flex items-center justify-center active:scale-90 shadow-sm z-50 border border-white/10"
               title="View Full Word Details"
             >
               <Search size={22} strokeWidth={2.5} />
             </button>

             <h3 className="text-3xl sm:text-4xl font-black mb-6 text-[#FFB800] font-heading z-10 drop-shadow-md mt-4">{currentWord?.word}</h3>
             
             <div className="bg-white/10 p-5 rounded-2xl w-full text-center backdrop-blur-sm border border-white/20 z-10 shadow-inner">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB800] block mb-2 opacity-80">Meaning</span>
                <p className="text-xl sm:text-2xl font-bold leading-snug">{currentWord?.meaning}</p>
             </div>
             
             {/* TAGS SECTION */}
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
               <span className="mt-5 bg-white/20 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/10 z-10 shadow-sm">{currentWord.partOfSpeech}</span>
             )}
          </div>
        </motion.div>
      </div>

      <div className="h-32 mt-6 max-w-md mx-auto w-full flex justify-center items-center relative z-10">
        <AnimatePresence>
          {isFlipped && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="grid grid-cols-2 gap-3 w-full">
              <button disabled={isUpdating} onClick={() => handleRating('again')} className="w-full bg-white text-rose-500 py-3 rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(244,63,94,0.15)] border-b-4 border-rose-200 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 hover:bg-rose-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <RotateCcw size={20} strokeWidth={2.5}/>} Forgot
              </button>
              <button disabled={isUpdating} onClick={() => handleRating('hard')} className="w-full bg-white text-[#FFB800] py-3 rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(255,184,0,0.15)] border-b-4 border-[#FFB800]/30 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 hover:bg-yellow-50">
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : <Brain size={20} strokeWidth={2.5}/>} Hard
              </button>
              <button disabled={isUpdating} onClick={() => handleRating('easy')} className="w-full bg-[#8B004A] text-white py-3 rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(139,0,74,0.2)] border-b-4 border-[#600033] flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 hover:bg-[#a80059]">
                {isUpdating ? <Loader2 className="animate-spin text-white" size={20}/> : <Check size={20} strokeWidth={2.5}/>} Got It
              </button>
              <button disabled={isUpdating} onClick={() => handleRating('mastered')} className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(16,185,129,0.2)] border-b-4 border-emerald-700 flex flex-col items-center gap-1 active:scale-95 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 hover:bg-emerald-400">
                {isUpdating ? <Loader2 className="animate-spin text-white" size={20}/> : <Award size={20} strokeWidth={2.5}/>} I Know This
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}