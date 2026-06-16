import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PracticePage() {
  const [userEmail, setUserEmail] = useState("");
  const [historyWords, setHistoryWords] = useState([]);
  const [activeTab, setActiveTab] = useState("words");
  
  const [dueReviews, setDueReviews] = useState([]); 
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isClearMode, setIsClearMode] = useState(false); 
  const [mistakeWords, setMistakeWords] = useState([]); 
  const [allMistakesRaw, setAllMistakesRaw] = useState([]); 

  // Game Flow States
  const [selectedWordObj, setSelectedWordObj] = useState(null);
  const [practiceSentences, setPracticeSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  
  const [isCorrect, setIsCorrect] = useState(null);
  const [userStats, setUserStats] = useState({ totalSearched: 0, totalPracticed: 0, totalMistakes: 0 });

  // 🔥 Gamification States
  const [comboStreak, setComboStreak] = useState(0);

  // Random Flashcard States
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [randomWordInfo, setRandomWordInfo] = useState(null);
  const [showRandomAnswer, setShowRandomAnswer] = useState(false);

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

  // Centralized Sync Engine
  const fetchAllData = async () => {
    if (!userEmail || userEmail === "guest_user@gmail.com") return;
    try {
      const histRes = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
      const histData = await histRes.json();
      if (histRes.ok && histData.success) setHistoryWords(histData.data);

      const statsRes = await fetch(`${API_URL}/api/words/stats/${encodeURIComponent(userEmail)}`);
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) setUserStats(statsData.data);

      const reviewRes = await fetch(`${API_URL}/api/words/srs/due/${encodeURIComponent(userEmail)}`);
      const reviewData = await reviewRes.json();
      if (reviewRes.ok && reviewData.success) setDueReviews(reviewData.data);

      const allMistakesRes = await fetch(`${API_URL}/api/words/srs/all-mistakes/${encodeURIComponent(userEmail)}`);
      const allMistakesData = await allMistakesRes.json();
      
      if (allMistakesRes.ok && allMistakesData.success) {
        setAllMistakesRaw(allMistakesData.data);
        const uniqueMistakeWords = [];
        allMistakesData.data.forEach(item => {
          if (!uniqueMistakeWords.some(w => w.word.toLowerCase() === item.word.toLowerCase())) {
            uniqueMistakeWords.push({ word: item.word, rawItem: item });
          }
        });
        setMistakeWords(uniqueMistakeWords);
      }
    } catch (err) {
      console.error("Data sync error:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [userEmail, API_URL]);

  // 🔥 NEW: Audio Pronunciation Function
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower for clear dictation
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Audio not supported in this browser!");
    }
  };

  const parseSavedSentences = (text, word) => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim().length > 5);
    const parsed = [];
    lines.forEach(line => {
      const match = line.match(/(.*?)\((.*?)\)/);
      if (match) {
        let eng = match[1].replace(/^[\d\.\*\-\s]+/, '').trim();
        let hin = match[2].trim();
        if (eng && hin) parsed.push({ englishSentence: eng, hindiSentence: hin, word: word });
      }
    });
    return parsed.length > 0 ? parsed : lines.map(line => ({ 
        englishSentence: line.replace(/^[\d\.\*\-\s]+/, '').trim(), 
        hindiSentence: "Translate this sentence:",
        word: word
    }));
  };

  const startSRSSession = () => {
    if (dueReviews.length === 0) return toast.success("Aaj ke scheduled reviews pure hain! 🎉");
    setIsReviewMode(true);
    setIsClearMode(false);
    setIsRandomMode(false);
    setSelectedWordObj({ word: "Scheduled SRS Review" });
    setPracticeSentences(dueReviews); 
    setCurrentSentenceIndex(0);
    loadSentenceGame(dueReviews[0]);
  };

  const startMistakePracticeForWord = (wordName) => {
    const filteredMistakes = allMistakesRaw.filter(item => item.word.toLowerCase() === wordName.toLowerCase());
    if (filteredMistakes.length === 0) return toast.error("Is word ki abhi koi active mistakes nahi hain!");

    setIsReviewMode(true); 
    setIsClearMode(false);
    setIsRandomMode(false);
    setSelectedWordObj({ word: wordName });
    setPracticeSentences(filteredMistakes);
    setCurrentSentenceIndex(0);
    loadSentenceGame(filteredMistakes[0]);
  };

  const startClearChallenge = (wordName) => {
    const filteredMistakes = allMistakesRaw.filter(item => item.word.toLowerCase() === wordName.toLowerCase());
    if (filteredMistakes.length === 0) return toast.error("Koi active mistake nahi mili!");

    setIsReviewMode(false); 
    setIsClearMode(true); 
    setIsRandomMode(false);
    setSelectedWordObj({ word: wordName });
    
    const testSentence = filteredMistakes[Math.floor(Math.random() * filteredMistakes.length)];
    setPracticeSentences([testSentence]); 
    setCurrentSentenceIndex(0);
    loadSentenceGame(testSentence);
  };

  const startNormalPracticeForWord = (wordObj) => {
    if (!wordObj.sentences) return toast.error("Is word ke sentences save nahi hain.");
    const parsedSentences = parseSavedSentences(wordObj.sentences, wordObj.word);
    if (parsedSentences.length === 0) return toast.error("Sentences load nahi ho paye!");
    
    setIsReviewMode(false);
    setIsClearMode(false);
    setIsRandomMode(false);
    setSelectedWordObj(wordObj);
    setPracticeSentences(parsedSentences);
    setCurrentSentenceIndex(0);
    loadSentenceGame(parsedSentences[0]);
  };

  const triggerRandomChallenge = () => {
    if (historyWords.length === 0) return toast.error("Bhai, pehle kuch words search toh kar lo!");
    
    const randomIndex = Math.floor(Math.random() * historyWords.length);
    const selectedRandom = historyWords[randomIndex];
    
    setRandomWordInfo(selectedRandom);
    setShowRandomAnswer(false);
    setIsRandomMode(true);
    
    // Auto-play audio when flashcard opens
    setTimeout(() => playAudio(selectedRandom.word), 300);
    
    setSelectedWordObj(null);
    setCurrentChallenge(null);
  };

  const loadSentenceGame = (sentenceObj) => {
    setCurrentChallenge(sentenceObj);
    setIsCorrect(null);
    setSelectedWords([]);

    const cleanSentence = sentenceObj.englishSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").toLowerCase().trim();
    const correctWordsArr = cleanSentence.split(/\s+/).filter(w => w);
    const dummyWords = ["is", "the", "not", "very", "a", "an", "to", "are", "was"].sort(() => Math.random() - 0.5).slice(0, 2);
    
    let combinedWords = [...correctWordsArr, ...dummyWords].sort(() => Math.random() - 0.5);
    setAvailableWords(combinedWords.map((word, index) => ({ id: `word-${index}-${Date.now()}`, text: word })));
  };

  const handleWordSelect = (wordObj) => {
    setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    setSelectedWords([...selectedWords, wordObj]);
  };

  const handleWordDeselect = (wordObj) => {
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setAvailableWords([...availableWords, wordObj]);
  };

  const checkAnswer = async () => {
    if (!currentChallenge) return;
    const userSentence = selectedWords.map(w => w.text).join(" ").trim().toLowerCase();
    const correctSentenceClean = currentChallenge.englishSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").trim().toLowerCase();

    const isAnswerCorrect = userSentence === correctSentenceClean;

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setComboStreak(prev => prev + 1); // 🔥 Boost streak
      
      // Auto play the full correct sentence
      playAudio(currentChallenge.englishSentence);

      if (isClearMode) {
        toast.success("Verification Passed! 🎯");
        try {
          await fetch(`${API_URL}/api/words/srs/clear-word-mistakes`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userEmail, word: selectedWordObj.word })
          });
          
          toast.success(`'${selectedWordObj.word}' cleared from mistakes! 🗑️`);
          
          setTimeout(() => {
            setSelectedWordObj(null);
            setCurrentChallenge(null);
            setIsClearMode(false);
            fetchAllData(); 
          }, 1500);
          return; 
        } catch (err) {
          console.error("Clear mistake DB error", err);
        }
      } else {
         toast.success(`Sahi Jawab! ${comboStreak > 1 ? `🔥 Combo x${comboStreak + 1}` : '🎯'}`);
      }
    } else {
      setIsCorrect(false);
      setComboStreak(0); // ❌ Reset streak

      if (isClearMode) {
        toast.error("Test Failed! Back to practice mode. 😅");
        setIsClearMode(false);
        setIsReviewMode(true); 
      } else {
        toast.error("Oops! Galat sequence.");
        if (!isReviewMode) {
          try {
            await fetch(`${API_URL}/api/words/srs/review`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userEmail,
                word: currentChallenge.word || selectedWordObj.word, 
                hindiSentence: currentChallenge.hindiSentence,
                englishSentence: currentChallenge.englishSentence,
                grade: 'again' 
              })
            });
          } catch (err) { console.error("Silently saving to SentenceReview failed"); }
        }
      }
    }

    try {
      await fetch(`${API_URL}/api/words/stats/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userEmail, isCorrect: isAnswerCorrect })
      });
      setUserStats(prev => ({
          ...prev,
          totalPracticed: prev.totalPracticed + 1,
          totalMistakes: isAnswerCorrect ? prev.totalMistakes : prev.totalMistakes + 1
      }));
    } catch (err) {}
  };

  const handleAnkiReview = async (grade) => {
    try {
      await fetch(`${API_URL}/api/words/srs/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userEmail,
          word: currentChallenge.word || selectedWordObj.word, 
          hindiSentence: currentChallenge.hindiSentence,
          englishSentence: currentChallenge.englishSentence,
          grade: grade
        })
      });
    } catch (err) { console.error("SRS database save error"); }
    handleNextSentence();
  };

  const handleNextSentence = () => {
    if (currentSentenceIndex + 1 < practiceSentences.length) {
      const nextIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(nextIndex);
      loadSentenceGame(practiceSentences[nextIndex]);
    } else {
      toast.success(isReviewMode ? "Sequence Complete! Epic Run! 🏆" : `'${selectedWordObj.word}' Conquered! ⚔️`);
      setSelectedWordObj(null);
      setCurrentChallenge(null);
      setIsReviewMode(false);
      setIsClearMode(false);
      fetchAllData(); 
    }
  };

  // Gamification Metrics
  const accuracy = userStats.totalPracticed > 0 
    ? Math.round(((userStats.totalPracticed - userStats.totalMistakes) / userStats.totalPracticed) * 100) 
    : 0;
  
  const progressPercent = selectedWordObj && practiceSentences.length > 0 
    ? ((currentSentenceIndex) / practiceSentences.length) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10 font-sans selection:bg-cyan-500/30">
      <Toaster position="top-center" toastOptions={{ style: { background: '#121216', color: '#fff', border: '1px solid #333' } }} />

      {/* Hide Dashboard Stats when in Random Mode to give full focus to the Flashcard */}
      {!isRandomMode && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
          
          {/* Main Title */}
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-3xl md:text-4xl font-black italic uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
              DAMEETO ARENA
            </h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
              Syntax & Recall Engine
            </p>
          </div>

          {/* 🔥 Competitive Scoreboard */}
          <div className="w-full max-w-xl bg-gradient-to-b from-[#141419] to-[#0b0b0e] border border-white/10 rounded-2xl p-4 mb-6 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full h-10 bg-cyan-500/20 blur-[40px]"></div>
            
            <div className="flex justify-between items-center relative z-10">
              <div className="text-center flex-1 border-r border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Rank Acc.</p>
                  <p className={`text-xl font-black ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {accuracy}%
                  </p>
              </div>
              <div className="text-center flex-1 border-r border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">XP Practiced</p>
                  <p className="text-xl font-black text-cyan-400">{userStats.totalPracticed}</p>
              </div>
              <div className="text-center flex-1 border-r border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-1">Mistakes</p>
                  <p className="text-xl font-black text-rose-400">{userStats.totalMistakes}</p>
              </div>
              <div className="text-center flex-1">
                  <p className="text-[9px] text-orange-500/80 uppercase tracking-widest font-black mb-1">Streak</p>
                  <p className="text-xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                    {comboStreak} 🔥
                  </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className={`w-full max-w-xl bg-[#0b0b0e]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 ${isRandomMode ? 'mt-10 scale-105 border-purple-500/30' : ''}`}>
        
        {/* SCREEN 1: DASHBOARD LAYOUT */}
        {!selectedWordObj && !isRandomMode && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* SRS Active Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-900/30 to-rose-900/20 border border-orange-500/30 p-4 rounded-2xl flex justify-between items-center shadow-lg group">
               <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <h3 className="text-orange-400 font-black uppercase tracking-widest text-xs mb-1 flex items-center gap-1.5">
                    ⚔️ Daily Quests (SRS)
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">
                    Pending Reviews: <strong className="text-white text-xs ml-1 bg-orange-500/20 px-1.5 py-0.5 rounded">{dueReviews.length}</strong>
                  </p>
               </div>
               <button 
                 onClick={startSRSSession}
                 disabled={dueReviews.length === 0}
                 className="relative z-10 bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:shadow-none"
               >
                 Start ▶
               </button>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex bg-black/50 p-1.5 rounded-xl border border-white/5 relative">
              <button 
                onClick={() => setActiveTab("words")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'words' ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                📖 Arsenal
              </button>
              <button 
                onClick={() => setActiveTab("mistakes")}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'mistakes' ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                ❌ Hitlist 
                {mistakeWords.length > 0 && <span className="bg-rose-500 text-white font-black px-2 py-0.5 rounded-full text-[10px] shadow-sm">{mistakeWords.length}</span>}
              </button>
            </div>

            {/* VIEW A: WORDS LIST */}
            {activeTab === "words" && (
              <div className="space-y-4">
                {/* 🔥 RANDOM CHALLENGE BUTTON */}
                <button 
                  onClick={triggerRandomChallenge}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2"
                >
                  <span className="text-lg">🎲</span> Random Deathmatch
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  <p className="text-center text-cyan-500/70 font-black uppercase tracking-widest text-[9px]">Select Target to Practice</p>
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                {historyWords.length === 0 ? (
                  <div className="text-center text-slate-500 py-10 text-xs italic bg-black/20 border border-white/5 rounded-xl">Arsenal is empty. Search to add weapons!</div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 justify-center max-h-[300px] overflow-y-auto pb-2 scrollbar-none">
                    {historyWords.map((wordObj, i) => (
                      <button
                        key={i}
                        onClick={() => startNormalPracticeForWord(wordObj)}
                        className="bg-[#141419] border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-950/30 hover:text-cyan-300 px-4 py-2.5 rounded-xl text-slate-300 font-bold text-sm transition-all transform hover:scale-105 active:scale-95"
                      >
                        {wordObj.word}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW B: MISTAKES TAB */}
            {activeTab === "mistakes" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-1">
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                  <p className="text-center text-rose-400/70 font-black uppercase tracking-widest text-[9px]">Targets needing revenge</p>
                  <div className="h-[1px] flex-1 bg-white/5"></div>
                </div>

                {mistakeWords.length === 0 ? (
                  <div className="text-center text-emerald-400 py-12 text-xs bg-emerald-950/10 border border-emerald-500/20 rounded-xl px-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="text-2xl block mb-2">🏆</span>
                    Hitlist cleared! You are unstoppable.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {mistakeWords.map((item, i) => (
                      <div key={i} className="bg-[#141419] border border-white/5 hover:border-rose-500/40 rounded-xl flex items-center justify-between p-3.5 transition-all shadow-sm group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-sm border border-rose-500/20 group-hover:scale-110 transition-transform">⚠️</div>
                           <span className="text-slate-100 font-black text-sm uppercase tracking-wider">{item.word}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => startMistakePracticeForWord(item.word)} 
                             className="bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                           >
                             FIGHT ⚔️
                           </button>
                           <button 
                             onClick={() => startClearChallenge(item.word)} 
                             className="bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:text-white text-emerald-400 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                           >
                             CLEAR ✅
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* SCREEN 2: ACTIVE GAMEPLAY ZONE */}
        {selectedWordObj && currentChallenge && !isRandomMode && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            
            {/* Action Header */}
            <div className="flex flex-col gap-3 bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
              <div className="flex justify-between items-center w-full">
                <button 
                  onClick={() => { setSelectedWordObj(null); setCurrentChallenge(null); setIsReviewMode(false); setIsClearMode(false); fetchAllData(); }}
                  className="text-[10px] bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-colors"
                >
                  ◀ Retreat
                </button>
                <div className="text-center flex-1">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 block mb-0.5">
                    {isClearMode ? "BOSS BATTLE 🛡️" : isReviewMode ? "REVENGE MODE 🔥" : "TRAINING GROUND"}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-black uppercase tracking-widest text-lg ${isClearMode ? "text-amber-400" : isReviewMode ? "text-rose-400" : "text-cyan-400"}`}>
                      {selectedWordObj.word}
                    </span>
                    {/* 🔥 Pronunciation Button */}
                    <button 
                      onClick={() => playAudio(selectedWordObj.word)}
                      className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs border border-white/10 hover:border-cyan-500/50 transition-all active:scale-90"
                      title="Play Pronunciation"
                    >
                      🔊
                    </button>
                  </div>
                </div>
                <div className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  {currentSentenceIndex + 1} / {practiceSentences.length}
                </div>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Translation Target */}
            <div className="bg-gradient-to-b from-[#1a1a24] to-transparent border border-white/10 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-emerald-400 block mb-3">Target Meaning:</span>
              <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed drop-shadow-md">
                "{currentChallenge.hindiSentence}"
              </p>
            </div>

            {/* Construction Zone */}
            <div className="min-h-[110px] bg-black/30 border-2 border-dashed border-white/10 hover:border-white/20 transition-colors rounded-2xl p-5 flex flex-wrap gap-2 items-start content-start shadow-inner">
              {selectedWords.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-[11px] font-black uppercase tracking-widest opacity-50">
                  Assemble the Syntax
                </div>
              ) : (
                selectedWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordDeselect(wordObj)}
                    className="bg-cyan-900/40 border border-cyan-400/40 hover:bg-rose-900/40 hover:border-rose-400/40 px-4 py-2 rounded-xl text-cyan-50 font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {wordObj.text}
                  </button>
                ))
              )}
            </div>

            {/* Word Pool */}
            {isCorrect === null && (
              <div className="flex flex-wrap gap-2.5 justify-center pt-2">
                {availableWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordSelect(wordObj)}
                    className="bg-[#1a1a24] border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-900/30 hover:text-emerald-300 px-5 py-3 rounded-xl text-slate-200 font-bold text-sm transition-all shadow-md transform hover:-translate-y-1 active:translate-y-0"
                  >
                    {wordObj.text}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Dashboard */}
            <div className="pt-4 flex flex-col gap-4">
              {isCorrect === null && (
                <button
                  onClick={checkAnswer}
                  disabled={selectedWords.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-30 disabled:hover:transform-none py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_5px_20px_rgba(6,182,212,0.3)]"
                >
                  Submit Answer 🚀
                </button>
              )}

              {isCorrect === false && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-in shake duration-300">
                   <p className="text-rose-400 text-xs font-black uppercase tracking-[0.2em] mb-3">❌ Syntax Error</p>
                   <div className="flex items-center justify-center gap-3 bg-black/50 py-3 px-4 rounded-xl mb-5 border border-rose-500/20">
                     <p className="text-lg text-rose-50 font-semibold">{currentChallenge.englishSentence}</p>
                     <button onClick={() => playAudio(currentChallenge.englishSentence)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">🔊</button>
                   </div>
                   <button 
                     onClick={handleNextSentence} 
                     className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
                   >
                     Acknowledge & Continue ⏭️
                   </button>
                </div>
              )}

              {isCorrect === true && !isClearMode && (
                <>
                  {!isReviewMode ? (
                    <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300">
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">🎯 Perfect Execution!</p>
                      <button 
                        onClick={handleNextSentence} 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
                      >
                        Next Target ⏭️
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-center space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                       <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">🎯 Hit Confirmed!</p>
                       <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">Select Memory Interval:</p>
                       <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => handleAnkiReview('again')} className="group flex flex-col items-center py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all active:scale-95">
                            <span className="text-[11px] uppercase font-black group-hover:scale-110 transition-transform">Again</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1">&lt;10m</span>
                          </button>
                          <button onClick={() => handleAnkiReview('hard')} className="group flex flex-col items-center py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl transition-all active:scale-95">
                            <span className="text-[11px] uppercase font-black group-hover:scale-110 transition-transform">Hard</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1">1d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('good')} className="group flex flex-col items-center py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl transition-all active:scale-95 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                            <span className="text-[11px] uppercase font-black group-hover:scale-110 transition-transform">Good</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1">3d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('easy')} className="group flex flex-col items-center py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all active:scale-95">
                            <span className="text-[11px] uppercase font-black group-hover:scale-110 transition-transform">Easy</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1">5d+</span>
                          </button>
                       </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 🔥 SCREEN 3: RANDOM FLASHCARD ZONE (FULL FOCUS) */}
        {isRandomMode && randomWordInfo && (
          <div className="space-y-6 animate-in zoom-in duration-300">
            {/* Header for Flashcard */}
            <div className="flex justify-between items-center bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
              <button 
                onClick={() => { setIsRandomMode(false); setRandomWordInfo(null); }}
                className="text-[10px] bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all"
              >
                ✕ Abort Test
              </button>
              <div className="text-center flex items-center justify-center gap-2">
                <span className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-black block">
                  SPEED RECALL
                </span>
                <span className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></span>
              </div>
              <div className="w-[85px]"></div> {/* Spacer */}
            </div>

            {/* The Flashcard */}
            <div className="bg-gradient-to-b from-[#1a1025] to-[#0a0a0f] border border-purple-500/30 rounded-[2.5rem] p-8 md:p-12 text-center shadow-[0_20px_60px_rgba(147,51,234,0.15)] min-h-[350px] flex flex-col justify-center items-center relative overflow-hidden group">
              
              {/* Dynamic Animated Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/30 transition-colors duration-700"></div>

              <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-5xl md:text-6xl font-black text-white tracking-wide mb-4 capitalize drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {randomWordInfo.word}
                </h2>
                
                <div className="flex items-center gap-3 mb-8">
                  {randomWordInfo.pronunciation && (
                    <p className="text-base text-purple-300/80 font-medium italic">
                      /{randomWordInfo.pronunciation}/
                    </p>
                  )}
                  {/* Speaker Button on Flashcard */}
                  <button 
                    onClick={() => playAudio(randomWordInfo.word)}
                    className="w-10 h-10 rounded-full bg-purple-500/20 hover:bg-purple-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all transform hover:scale-110 active:scale-95"
                    title="Play Pronunciation"
                  >
                    🔊
                  </button>
                </div>

                {!showRandomAnswer ? (
                  <button
                    onClick={() => setShowRandomAnswer(true)}
                    className="relative overflow-hidden bg-white/5 hover:bg-white/10 border border-white/20 text-white px-10 py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all mt-4 z-10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 group-hover:border-purple-400/50"
                  >
                    <span className="relative z-10">Reveal Target 👀</span>
                  </button>
                ) : (
                  <div className="animate-in slide-in-from-bottom-6 fade-in duration-500 w-full flex flex-col items-center mt-2 w-full max-w-md">
                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mb-8"></div>
                    
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-emerald-400 block mb-3 drop-shadow-md">
                      Intel (Meaning):
                    </span>
                    <p className="text-2xl md:text-3xl font-bold text-emerald-50 leading-relaxed bg-black/40 px-8 py-6 rounded-3xl border border-emerald-500/20 w-full shadow-inner">
                      {randomWordInfo.meaning || randomWordInfo.hindiMeaning || "Meaning not available in DB"}
                    </p>
                    
                    <button
                        onClick={triggerRandomChallenge}
                        className="mt-10 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(147,51,234,0.4)] hover:shadow-[0_10px_40px_rgba(147,51,234,0.6)] transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2"
                    >
                        Load Next Target ⚡
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}