import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PracticePage() {
  const [userEmail, setUserEmail] = useState("");
  const [historyWords, setHistoryWords] = useState([]);
  
  // 🔥 SRS Review States
  const [dueReviews, setDueReviews] = useState([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // Game Flow States
  const [selectedWordObj, setSelectedWordObj] = useState(null);
  const [practiceSentences, setPracticeSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  
  // Results & UI
  const [isCorrect, setIsCorrect] = useState(null);
  const [userStats, setUserStats] = useState({ totalSearched: 0, totalPracticed: 0, totalMistakes: 0 });

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:3000" 
    : "https://serdeptry1st.onrender.com";

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("eng_userEmail");
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail.trim());
    } else {
      setUserEmail("guest_user@gmail.com");
    }
  }, []);

  // 1. Fetch All Data (History, Stats, and Due SRS Reviews)
  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail || userEmail === "guest_user@gmail.com") return;
      try {
        // Fetch Words History
        const histRes = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
        const histData = await histRes.json();
        if (histRes.ok && histData.success) setHistoryWords(histData.data);

        // Fetch User Stats
        const statsRes = await fetch(`${API_URL}/api/words/stats/${encodeURIComponent(userEmail)}`);
        const statsData = await statsRes.json();
        if (statsRes.ok && statsData.success) setUserStats(statsData.data);

        // Fetch Due SRS Reviews
        const reviewRes = await fetch(`${API_URL}/api/words/srs/due/${encodeURIComponent(userEmail)}`);
        const reviewData = await reviewRes.json();
        if (reviewRes.ok && reviewData.success) setDueReviews(reviewData.data);

      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };
    fetchData();
  }, [userEmail, API_URL]);

  // Saved sentences ko parse karna
  const parseSavedSentences = (text) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim().length > 5);
    const parsed = [];
    lines.forEach(line => {
      const match = line.match(/(.*?)\((.*?)\)/);
      if (match) {
        let eng = match[1].replace(/^[\d\.\*\-\s]+/, '').trim();
        let hin = match[2].trim();
        if (eng && hin) parsed.push({ englishSentence: eng, hindiSentence: hin });
      }
    });
    return parsed.length > 0 ? parsed : lines.map(line => ({ 
        englishSentence: line.replace(/^[\d\.\*\-\s]+/, '').trim(), 
        hindiSentence: "Translate this sentence:" 
    }));
  };

  // 🔥 Start Review Mode (Anki Memory Flow)
  const startReviewSession = () => {
    if (dueReviews.length === 0) return toast.success("Aaj ke saare reviews complete hain! 🎉");
    setIsReviewMode(true);
    setSelectedWordObj({ word: "Review Mode" });
    setPracticeSentences(dueReviews); // Backend se aaye huye object directly pass
    setCurrentSentenceIndex(0);
    loadSentenceGame(dueReviews[0]);
  };

  // Start Normal Practice
  const startPracticeForWord = (wordObj) => {
    if (!wordObj.sentences) return toast.error("Is word ke sentences save nahi hain.");
    const parsedSentences = parseSavedSentences(wordObj.sentences);
    if (parsedSentences.length === 0) return toast.error("Sentences load nahi ho paye!");
    
    setIsReviewMode(false);
    setSelectedWordObj(wordObj);
    setPracticeSentences(parsedSentences);
    setCurrentSentenceIndex(0);
    loadSentenceGame(parsedSentences[0]);
  };

  const loadSentenceGame = (sentenceObj) => {
    setCurrentChallenge(sentenceObj);
    setIsCorrect(null);
    setSelectedWords([]);

    const cleanSentence = sentenceObj.englishSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
    const correctWordsArr = cleanSentence.split(" ").filter(w => w);
    const dummyWords = ["is", "the", "not", "very", "a", "an", "to", "are", "was"].sort(() => Math.random() - 0.5).slice(0, 2);
    
    let combinedWords = [...correctWordsArr, ...dummyWords].sort(() => Math.random() - 0.5);
    setAvailableWords(combinedWords.map((word, index) => ({ id: `word-${index}`, text: word })));
  };

  const handleWordSelect = (wordObj) => {
    setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    setSelectedWords([...selectedWords, wordObj]);
  };

  const handleWordDeselect = (wordObj) => {
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setAvailableWords([...availableWords, wordObj]);
  };

  // VERIFY ANSWER & TRIGGER SRS
  const checkAnswer = async () => {
    if (!currentChallenge) return;
    const userSentence = selectedWords.map(w => w.text).join(" ").trim().toLowerCase();
    const correctSentenceClean = currentChallenge.englishSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim().toLowerCase();

    const isAnswerCorrect = userSentence === correctSentenceClean;

    if (isAnswerCorrect) {
      setIsCorrect(true);
      toast.success("Sahi Jawab! 🎯");
    } else {
      setIsCorrect(false);
      toast.error("Oops! Galat sequence.");
      // Silent 'Again' mark in DB if they failed
      handleAnkiReview('again', false); 
    }

    // Update global Stats
    try {
      const res = await fetch(`${API_URL}/api/words/stats/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userEmail, isCorrect: isAnswerCorrect })
      });
      const resData = await res.json();
      if (resData.success) {
         setUserStats(prev => ({
             ...prev,
             totalPracticed: prev.totalPracticed + 1,
             totalMistakes: isAnswerCorrect ? prev.totalMistakes : prev.totalMistakes + 1
         }));
      }
    } catch (err) {}
  };

  // 🔥 Update Anki SRS Interval and move to next
  const handleAnkiReview = async (grade, shouldMoveNext = true) => {
    try {
      await fetch(`${API_URL}/api/words/srs/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userEmail,
          // Agar review mode hai to current challenge me word milega, warna selected word me
          word: currentChallenge.word || selectedWordObj.word, 
          hindiSentence: currentChallenge.hindiSentence,
          englishSentence: currentChallenge.englishSentence,
          grade: grade // 'again', 'hard', 'good', 'easy'
        })
      });
    } catch (err) { console.error("SRS update failed"); }

    if (shouldMoveNext) handleNextSentence();
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex + 1 < practiceSentences.length) {
      const nextIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIndex);
      loadSentenceGame(practiceSentences[nextIndex]);
    } else {
      toast.success(isReviewMode ? "Great! Review Session Complete! 🏆" : `'${selectedWordObj.word}' practice done! 👏`);
      setSelectedWordObj(null);
      setCurrentChallenge(null);
      
      // Refresh due reviews automatically if they were in review mode
      if (isReviewMode) {
          fetch(`${API_URL}/api/words/srs/due/${encodeURIComponent(userEmail)}`)
            .then(res => res.json())
            .then(data => { if(data.success) setDueReviews(data.data); });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10 font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#121216', color: '#fff', border: '1px solid #333' } }} />

      {/* Title Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-wide">
          🎮 Dameeto Syntax Builder
        </h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          AI Spaced Repetition Engine
        </p>
      </div>

      {/* Global Scoreboard */}
      <div className="w-full max-w-xl flex justify-between items-center bg-[#0b0b0e]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-6 shadow-2xl">
        <div className="text-center flex-1 border-r border-white/5">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Words</p>
            <p className="text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{userStats.totalSearched}</p>
        </div>
        <div className="text-center flex-1 border-r border-white/5">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Practiced</p>
            <p className="text-xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">{userStats.totalPracticed}</p>
        </div>
        <div className="text-center flex-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Mistakes</p>
            <p className="text-xl font-black text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]">{userStats.totalMistakes}</p>
        </div>
      </div>

      <div className="w-full max-w-xl bg-[#0b0b0e] border border-white/[0.05] rounded-[2rem] p-5 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* ============================================================== */}
        {/* SCREEN 1: DASHBOARD (Word Selection & SRS Banner) */}
        {/* ============================================================== */}
        {!selectedWordObj && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* 🔥 SRS Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-orange-900/30 to-rose-950/40 border border-orange-500/20 p-5 rounded-2xl flex justify-between items-center shadow-lg group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <div className="relative z-10">
                  <h3 className="text-orange-400 font-black uppercase tracking-wider text-sm mb-1 flex items-center gap-2">
                    🧠 Memory Review 
                    {dueReviews.length > 0 && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span></span>}
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    Pending Fixes: <strong className="text-orange-300 text-xs ml-1">{dueReviews.length}</strong>
                  </p>
               </div>
               <button 
                  onClick={startReviewSession}
                  disabled={dueReviews.length === 0}
                  className="relative z-10 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] active:scale-95"
               >
                  Play Reviews ▶
               </button>
            </div>

            {/* Word List */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                <h3 className="text-cyan-500 font-bold uppercase tracking-widest text-[10px]">Practice New Words</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
              </div>

              {historyWords.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm italic bg-black/20 rounded-xl border border-white/5">
                  Tumhari history khali hai, pehle dictionary me words search karo!
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5 justify-center max-h-[350px] overflow-y-auto pr-1 pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {historyWords.map((wordObj, i) => (
                    <button
                      key={i}
                      onClick={() => startPracticeForWord(wordObj)}
                      className="bg-black/40 border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-900/20 px-4 py-2.5 rounded-xl text-slate-300 hover:text-cyan-50 font-bold tracking-wide text-sm transition-all active:scale-95 shadow-sm"
                    >
                      {wordObj.word}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: GAMEPLAY (Translate & Validate) */}
        {/* ============================================================== */}
        {selectedWordObj && currentChallenge && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            
            {/* Header: Mode & Progress */}
            <div className="flex justify-between items-center bg-black/40 rounded-xl p-3 border border-white/5 shadow-inner">
              <button 
                onClick={() => { setSelectedWordObj(null); setCurrentChallenge(null); }}
                className="text-xs text-slate-400 hover:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                ✕ Exit
              </button>
              <div className="text-center">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 block mb-0.5">
                  {isReviewMode ? "SRS REVIEW" : "FOCUS WORD"}
                </span>
                <span className={`font-black uppercase tracking-wider text-sm ${isReviewMode ? "text-orange-400" : "text-cyan-400"}`}>
                  {isReviewMode ? currentChallenge.word : selectedWordObj.word}
                </span>
              </div>
              <div className="text-[10px] font-black tracking-widest text-slate-400 bg-white/5 px-3 py-1 rounded-md">
                {currentSentenceIndex + 1} / {practiceSentences.length}
              </div>
            </div>

            {/* Hindi Challenge Card */}
            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-6 text-center shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-emerald-500/50 rounded-b-full blur-[2px]"></div>
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 block mb-3 opacity-80">Translate This:</span>
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed drop-shadow-md">
                "{currentChallenge.hindiSentence}"
              </p>
            </div>

            {/* Answer Construction Zone */}
            <div className="min-h-[100px] bg-black/20 border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-wrap gap-2 items-start content-start transition-colors data-[filled=true]:border-cyan-500/30" data-filled={selectedWords.length > 0}>
              {selectedWords.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-medium uppercase tracking-widest pt-4 opacity-50">
                  Tap words below to build sentence
                </div>
              ) : (
                selectedWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordDeselect(wordObj)}
                    className="bg-cyan-950/40 border border-cyan-500/30 hover:bg-rose-950/40 hover:border-rose-500/30 px-4 py-2 rounded-xl text-cyan-50 font-bold text-sm transition-all active:scale-90 shadow-sm"
                  >
                    {wordObj.text}
                  </button>
                ))
              )}
            </div>

            {/* Jumbled Words Pool (Hide when checking answer) */}
            {isCorrect === null && (
              <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                {availableWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordSelect(wordObj)}
                    className="bg-[#1a1a20] border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300 px-5 py-3 rounded-xl text-slate-300 font-bold text-sm transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)] active:scale-95"
                  >
                    {wordObj.text}
                  </button>
                ))}
              </div>
            )}

            {/* Validation & SRS Action Buttons */}
            <div className="pt-4 flex flex-col gap-4">
              
              {/* STATUS: Unanswered */}
              {isCorrect === null && (
                <button
                  onClick={checkAnswer}
                  disabled={selectedWords.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-30 disabled:grayscale py-4 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  Verify Sentence
                </button>
              )}

              {/* STATUS: Incorrect */}
              {isCorrect === false && (
                <div className="animate-in slide-in-from-bottom-2 duration-300 bg-rose-950/40 border border-rose-500/30 rounded-2xl p-5 text-center shadow-lg">
                   <p className="text-rose-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                     <span className="text-lg">❌</span> Incorrect Structure
                   </p>
                   <p className="text-lg tracking-wide text-rose-50 mb-5 font-medium bg-black/30 py-3 px-2 rounded-xl">
                     {currentChallenge.englishSentence}
                   </p>
                   <button 
                     onClick={handleNextSentence} 
                     className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                   >
                     Got it, Next ⏭️
                   </button>
                </div>
              )}

              {/* STATUS: Correct (Anki Options) */}
              {isCorrect === true && (
                <div className="animate-in slide-in-from-bottom-2 duration-300 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5 text-center shadow-lg space-y-4">
                   <p className="text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                     <span className="text-lg">🎯</span> Perfect Translation!
                   </p>
                   <p className="text-slate-400 text-[10px] uppercase font-bold">When should we ask this again?</p>
                   
                   <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => handleAnkiReview('again')} className="flex flex-col items-center justify-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/50 py-3 rounded-xl transition-all active:scale-90">
                        <span className="text-[11px] uppercase font-black">Again</span>
                        <span className="text-[8px] opacity-70 font-bold bg-black/40 px-2 py-0.5 rounded-full">&lt;10 min</span>
                      </button>
                      <button onClick={() => handleAnkiReview('hard')} className="flex flex-col items-center justify-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 hover:border-orange-500/50 py-3 rounded-xl transition-all active:scale-90">
                        <span className="text-[11px] uppercase font-black">Hard</span>
                        <span className="text-[8px] opacity-70 font-bold bg-black/40 px-2 py-0.5 rounded-full">1 Day</span>
                      </button>
                      <button onClick={() => handleAnkiReview('good')} className="flex flex-col items-center justify-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50 py-3 rounded-xl transition-all active:scale-90">
                        <span className="text-[11px] uppercase font-black">Good</span>
                        <span className="text-[8px] opacity-70 font-bold bg-black/40 px-2 py-0.5 rounded-full">3 Days</span>
                      </button>
                      <button onClick={() => handleAnkiReview('easy')} className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/50 py-3 rounded-xl transition-all active:scale-90">
                        <span className="text-[11px] uppercase font-black">Easy</span>
                        <span className="text-[8px] opacity-70 font-bold bg-black/40 px-2 py-0.5 rounded-full">5+ Days</span>
                      </button>
                   </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}