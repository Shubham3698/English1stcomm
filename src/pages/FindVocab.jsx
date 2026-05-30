import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PracticePage() {
  const [userEmail, setUserEmail] = useState("");
  const [historyWords, setHistoryWords] = useState([]);
  const [activeTab, setActiveTab] = useState("words");
  
  const [dueReviews, setDueReviews] = useState([]); 
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isClearMode, setIsClearMode] = useState(false); // 🔥 NEW: Track verification mode 
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
    setSelectedWordObj({ word: wordName });
    setPracticeSentences(filteredMistakes);
    setCurrentSentenceIndex(0);
    loadSentenceGame(filteredMistakes[0]);
  };

  // 🔥 NEW: Function to start verification mode for deleting mistakes
  const startClearChallenge = (wordName) => {
    const filteredMistakes = allMistakesRaw.filter(item => item.word.toLowerCase() === wordName.toLowerCase());
    if (filteredMistakes.length === 0) return toast.error("Koi active mistake nahi mili!");

    setIsReviewMode(false); 
    setIsClearMode(true); 
    setSelectedWordObj({ word: wordName });
    
    // Pick a random sentence for the verification test
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
    setSelectedWordObj(wordObj);
    setPracticeSentences(parsedSentences);
    setCurrentSentenceIndex(0);
    loadSentenceGame(parsedSentences[0]);
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

  // 🔥 UPDATED: VERIFY ANSWER LOGIC
  const checkAnswer = async () => {
    if (!currentChallenge) return;
    const userSentence = selectedWords.map(w => w.text).join(" ").trim().toLowerCase();
    const correctSentenceClean = currentChallenge.englishSentence.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g,"").trim().toLowerCase();

    const isAnswerCorrect = userSentence === correctSentenceClean;

    if (isAnswerCorrect) {
      setIsCorrect(true);
      
      // ✅ SUCCESS IN CLEAR MODE
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
          return; // Stop execution here
        } catch (err) {
          console.error("Clear mistake DB error", err);
        }
      } else {
         toast.success("Sahi Jawab! 🎯");
      }

    } else {
      setIsCorrect(false);
      
      // ❌ FAILED IN CLEAR MODE
      if (isClearMode) {
        toast.error("Test Failed! Back to practice mode. 😅");
        setIsClearMode(false);
        setIsReviewMode(true); // Force them to review it properly
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

    // Global Stats Update
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
      toast.success(isReviewMode ? "Awesome! Sequence Complete! 🏆" : `'${selectedWordObj.word}' Done! 👏`);
      setSelectedWordObj(null);
      setCurrentChallenge(null);
      setIsReviewMode(false);
      setIsClearMode(false);
      fetchAllData(); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10 font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#121216', color: '#fff', border: '1px solid #333' } }} />

      {/* Header */}
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
            <p className="text-xl font-black text-cyan-400">{userStats.totalSearched}</p>
        </div>
        <div className="text-center flex-1 border-r border-white/5">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Practiced</p>
            <p className="text-xl font-black text-emerald-400">{userStats.totalPracticed}</p>
        </div>
        <div className="text-center flex-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Mistakes</p>
            <p className="text-xl font-black text-rose-400">{userStats.totalMistakes}</p>
        </div>
      </div>

      <div className="w-full max-w-xl bg-[#0b0b0e] border border-white/[0.05] rounded-[2rem] p-5 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* SCREEN 1: DASHBOARD LAYOUT */}
        {!selectedWordObj && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            
            {/* SRS Active Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-950/40 to-orange-950/30 border border-orange-500/20 p-4 rounded-2xl flex justify-between items-center shadow-md">
               <div>
                  <h3 className="text-orange-400 font-black uppercase tracking-wider text-xs mb-0.5 flex items-center gap-1.5">
                    ⚡ SRS Active Reviews
                  </h3>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">
                    Due Today: <strong className="text-orange-300 text-xs ml-1">{dueReviews.length}</strong>
                  </p>
               </div>
               <button 
                 onClick={startSRSSession}
                 disabled={dueReviews.length === 0}
                 className="bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 border border-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
               >
                 Launch SRS ▶
               </button>
            </div>

            {/* TAB NAVIGATION */}
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveTab("words")}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'words' ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                📖 Words List
              </button>
              <button 
                onClick={() => setActiveTab("mistakes")}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'mistakes' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ❌ Mistakes Tab 
                {mistakeWords.length > 0 && <span className="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded-full text-[9px]">{mistakeWords.length}</span>}
              </button>
            </div>

            {/* VIEW A: WORDS LIST */}
            {activeTab === "words" && (
              <div className="space-y-3">
                <p className="text-center text-cyan-500 font-bold uppercase tracking-widest text-[9px]">Select Word to Start Normal Practice</p>
                {historyWords.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 text-xs italic bg-black/10 border border-white/5 rounded-xl">History is empty. Search words first!</div>
                ) : (
                  <div className="flex flex-wrap gap-2 justify-center max-h-[350px] overflow-y-auto pb-2 scrollbar-none">
                    {historyWords.map((wordObj, i) => (
                      <button
                        key={i}
                        onClick={() => startNormalPracticeForWord(wordObj)}
                        className="bg-black/30 border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 px-3.5 py-2.5 rounded-xl text-slate-300 font-bold text-sm transition-all"
                      >
                        {wordObj.word}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🔥 VIEW B: POLISHED MISTAKES TAB */}
            {activeTab === "mistakes" && (
              <div className="space-y-3">
                <p className="text-center text-rose-400 font-bold uppercase tracking-widest text-[9px]">Words with recorded mistakes</p>
                {mistakeWords.length === 0 ? (
                  <div className="text-center text-slate-500 py-12 text-xs italic bg-emerald-950/10 border border-emerald-500/10 rounded-xl px-4">
                    🎉 Sab saaf hai! Koi pending mistakes wale words nahi mile.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pb-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {mistakeWords.map((item, i) => (
                      <div key={i} className="bg-[#121216]/80 border border-white/5 hover:border-rose-500/30 rounded-xl flex items-center justify-between p-3 transition-all shadow-sm">
                        <div className="flex items-center gap-2">
                           <span className="text-lg">⚠️</span>
                           <span className="text-rose-200 font-black text-sm uppercase tracking-wide">{item.word}</span>
                        </div>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => startMistakePracticeForWord(item.word)} 
                             className="bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
                           >
                             Practice 🔄
                           </button>
                           <button 
                             onClick={() => startClearChallenge(item.word)} 
                             className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
                           >
                             I Know It ✅
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
        {selectedWordObj && currentChallenge && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-black/40 rounded-xl p-3 border border-white/5">
              <button 
                onClick={() => { setSelectedWordObj(null); setCurrentChallenge(null); setIsReviewMode(false); setIsClearMode(false); fetchAllData(); }}
                className="text-xs text-slate-400 hover:text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                ✕ Exit
              </button>
              <div className="text-center">
                <span className="text-[8px] uppercase tracking-widest text-slate-500 block">
                  {isClearMode ? "VERIFICATION MODE 🛡️" : isReviewMode ? "MISTAKES/SRS TRAINING" : "NORMAL PRACTICE"}
                </span>
                <span className={`font-black uppercase tracking-wider text-sm ${isClearMode ? "text-amber-400" : isReviewMode ? "text-rose-400" : "text-cyan-400"}`}>
                  {selectedWordObj.word}
                </span>
              </div>
              <div className="text-[10px] font-black text-slate-400 bg-white/5 px-2.5 py-1 rounded-md">
                {currentSentenceIndex + 1}/{practiceSentences.length}
              </div>
            </div>

            {/* Hindi Card */}
            <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-2xl p-5 text-center shadow-lg">
              <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 block mb-2">Translate This:</span>
              <p className="text-lg md:text-xl font-medium text-white leading-relaxed">
                "{currentChallenge.hindiSentence}"
              </p>
            </div>

            {/* Construction Zone */}
            <div className="min-h-[100px] bg-black/20 border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-wrap gap-2 items-start content-start">
              {selectedWords.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-[11px] font-bold uppercase tracking-widest pt-4 opacity-50">
                  Build correct English syntax sequence
                </div>
              ) : (
                selectedWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordDeselect(wordObj)}
                    className="bg-cyan-950/40 border border-cyan-500/30 hover:bg-rose-950/40 hover:border-rose-500/30 px-3.5 py-1.5 rounded-xl text-cyan-50 font-bold text-sm transition-all"
                  >
                    {wordObj.text}
                  </button>
                ))
              )}
            </div>

            {/* Word Pool */}
            {isCorrect === null && (
              <div className="flex flex-wrap gap-2 justify-center pt-1">
                {availableWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordSelect(wordObj)}
                    className="bg-[#141419] border border-white/5 hover:border-emerald-500/40 hover:bg-emerald-950/20 hover:text-emerald-300 px-4 py-2.5 rounded-xl text-slate-300 font-semibold text-sm transition-all"
                  >
                    {wordObj.text}
                  </button>
                ))}
              </div>
            )}

            {/* Actions Dashboard */}
            <div className="pt-2 flex flex-col gap-4">
              
              {isCorrect === null && (
                <button
                  onClick={checkAnswer}
                  disabled={selectedWords.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-30 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
                >
                  Verify Sentence
                </button>
              )}

              {isCorrect === false && (
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 text-center">
                   <p className="text-rose-400 text-xs font-black uppercase tracking-widest mb-1.5">❌ Correction Strategy Required</p>
                   <p className="text-base text-rose-50 font-medium bg-black/40 py-2.5 px-2 rounded-lg mb-4">{currentChallenge.englishSentence}</p>
                   <button 
                     onClick={handleNextSentence} 
                     className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                   >
                     Continue ⏭️
                   </button>
                </div>
              )}

              {isCorrect === true && !isClearMode && (
                <>
                  {!isReviewMode ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center space-y-3">
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">🎯 Perfect Structuring!</p>
                      <button 
                        onClick={handleNextSentence} 
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Next Sentence ⏭️
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-center space-y-3">
                       <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">🎯 Error Overruled Successfully!</p>
                       <p className="text-slate-400 text-[9px] uppercase font-bold">Log execution pattern spacing interval:</p>
                       
                       <div className="grid grid-cols-4 gap-1.5">
                          <button onClick={() => handleAnkiReview('again')} className="flex flex-col items-center py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-black">Again</span>
                            <span className="text-[7px] opacity-70 font-bold mt-0.5">&lt;10m</span>
                          </button>
                          <button onClick={() => handleAnkiReview('hard')} className="flex flex-col items-center py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-black">Hard</span>
                            <span className="text-[7px] opacity-70 font-bold mt-0.5">1d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('good')} className="flex flex-col items-center py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-black">Good</span>
                            <span className="text-[7px] opacity-70 font-bold mt-0.5">3d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('easy')} className="flex flex-col items-center py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-black">Easy</span>
                            <span className="text-[7px] opacity-70 font-bold mt-0.5">5d+</span>
                          </button>
                       </div>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}