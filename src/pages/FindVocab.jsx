import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  Swords, 
  Target, 
  Zap, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Trophy,
  Flame,
  BrainCircuit,
  Eye
} from "lucide-react";

// 🔥 NAYA COMPONENT 1: Cash Count / Rolling Number Animation
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 1000;
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeOutQuart * (end - start) + start));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue}</span>;
};

// 🔥 NAYA COMPONENT 2: Slot Machine / Scramble Text Animation
const ScrambleText = ({ text }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let iteration = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%&*";
    let interval = null;

    setDisplayText(text.replace(/./g, () => chars[Math.floor(Math.random() * chars.length)]));

    interval = setInterval(() => {
      setDisplayText((currentText) =>
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3; 
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

export default function PracticePage() {
  const [userEmail, setUserEmail] = useState("");
  const [historyWords, setHistoryWords] = useState([]);
  const [activeTab, setActiveTab] = useState("words");
  
  const [dueReviews, setDueReviews] = useState([]); 
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isClearMode, setIsClearMode] = useState(false); 
  const [mistakeWords, setMistakeWords] = useState([]); 
  const [allMistakesRaw, setAllMistakesRaw] = useState([]); 

  const [selectedWordObj, setSelectedWordObj] = useState(null);
  const [practiceSentences, setPracticeSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  
  const [isCorrect, setIsCorrect] = useState(null);
  const [userStats, setUserStats] = useState({ totalSearched: 0, totalPracticed: 0, totalMistakes: 0 });
  const [comboStreak, setComboStreak] = useState(0);

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

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
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
    if (dueReviews.length === 0) return toast.success("Daily reviews complete! 🎉");
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
    if (filteredMistakes.length === 0) return toast.error("No active mistakes for this target!");

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
    if (filteredMistakes.length === 0) return toast.error("No active mistakes found!");

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
    if (!wordObj.sentences) return toast.error("No practice sentences saved for this target.");
    const parsedSentences = parseSavedSentences(wordObj.sentences, wordObj.word);
    if (parsedSentences.length === 0) return toast.error("Failed to load sentences!");
    
    setIsReviewMode(false);
    setIsClearMode(false);
    setIsRandomMode(false);
    setSelectedWordObj(wordObj);
    setPracticeSentences(parsedSentences);
    setCurrentSentenceIndex(0);
    loadSentenceGame(parsedSentences[0]);
  };

  const triggerRandomChallenge = () => {
    if (historyWords.length === 0) return toast.error("Arsenal is empty! Search some words first.");
    
    let randomIndex;
    let selectedRandom;

    if (historyWords.length > 1) {
      do {
        randomIndex = Math.floor(Math.random() * historyWords.length);
        selectedRandom = historyWords[randomIndex];
      } while (randomWordInfo && selectedRandom.word === randomWordInfo.word); 
    } else {
      selectedRandom = historyWords[0];
      toast("Only one target in arsenal!", { icon: "😅" });
    }
    
    setRandomWordInfo(selectedRandom);
    setShowRandomAnswer(false);
    setIsRandomMode(true);
    
    setTimeout(() => playAudio(selectedRandom.word), 1200);
    
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
      setComboStreak(prev => prev + 1); 
      playAudio(currentChallenge.englishSentence);

      if (isClearMode) {
        toast.success("Verification Passed! 🎯");
        try {
          await fetch(`${API_URL}/api/words/srs/clear-word-mistakes`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userEmail, word: selectedWordObj.word })
          });
          toast.success(`'${selectedWordObj.word}' cleared from hitlist! 🗑️`);
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
         toast.success(`Correct! ${comboStreak > 0 ? `🔥 Combo x${comboStreak + 1}` : '🎯'}`);
      }
    } else {
      setIsCorrect(false);
      setComboStreak(0); 

      if (isClearMode) {
        toast.error("Test Failed! Back to practice mode. 😅");
        setIsClearMode(false);
        setIsReviewMode(true); 
      } else {
        toast.error("Invalid syntax.");
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
          } catch (err) {}
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
      toast.success(isReviewMode ? "Sequence Complete! 🏆" : `'${selectedWordObj.word}' Conquered! ⚔️`);
      setSelectedWordObj(null);
      setCurrentChallenge(null);
      setIsReviewMode(false);
      setIsClearMode(false);
      fetchAllData(); 
    }
  };

  const accuracy = userStats.totalPracticed > 0 
    ? Math.round(((userStats.totalPracticed - userStats.totalMistakes) / userStats.totalPracticed) * 100) 
    : 0;
  
  const progressPercent = selectedWordObj && practiceSentences.length > 0 
    ? ((currentSentenceIndex) / practiceSentences.length) * 100 
    : 0;

  return (
    // Deep Navy Background matching UI
    <div className="min-h-screen bg-[#0b101a] text-white flex flex-col items-center p-4 py-8 font-sans overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: '#121c2d', color: '#fff', border: '1px solid #1e293b' } }} />

      {!isRandomMode && (
        <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in duration-300">
          
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              Training Arena
            </h2>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              Syntax & Recall Engine
            </p>
          </div>

          {/* 🔥 SCOREBOARD - Premium Card Styling */}
          <div className="w-full bg-[#121c2d] border border-blue-900/50 rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center gap-2">
              <div className="text-center flex-1 border-r border-gray-800">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Accuracy</p>
                  <p className={`text-lg font-bold ${accuracy >= 80 ? 'text-[#41ffd1]' : accuracy >= 50 ? 'text-yellow-500' : 'text-red-400'}`}>
                    <AnimatedNumber value={accuracy} />%
                  </p>
              </div>
              <div className="text-center flex-1 border-r border-gray-800">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">XP Practiced</p>
                  <p className="text-lg font-bold text-white">
                    <AnimatedNumber value={userStats.totalPracticed} />
                  </p>
              </div>
              <div className="text-center flex-1 border-r border-gray-800">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Errors</p>
                  <p className="text-lg font-bold text-gray-400">
                    <AnimatedNumber value={userStats.totalMistakes} />
                  </p>
              </div>
              <div className="text-center flex-1">
                  <p className="text-[9px] text-yellow-500/80 uppercase tracking-widest font-bold mb-1">Streak</p>
                  <p className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-1">
                    <AnimatedNumber value={comboStreak} /> <Flame size={14} />
                  </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={`w-full max-w-2xl transition-all duration-300 ${isRandomMode ? 'mt-4 md:mt-10' : ''}`}>
        
        {/* SCREEN 1: DASHBOARD LAYOUT */}
        {!selectedWordObj && !isRandomMode && (
          <div className="space-y-6 animate-fade-in">
            
            {/* SRS Active Banner - Cyan styled */}
            <div className="bg-[#121c2d] border border-[#41ffd1]/30 p-4 rounded-2xl flex justify-between items-center shadow-lg">
               <div className="flex-1 mr-2">
                  <h3 className="text-[#41ffd1] font-bold text-sm mb-1 flex items-center gap-2">
                    <BrainCircuit size={16} /> Daily Quests (SRS)
                  </h3>
                  <p className="text-gray-400 text-xs">
                    Pending Reviews: <strong className="text-white ml-1 bg-[#41ffd1]/10 border border-[#41ffd1]/20 px-2 py-0.5 rounded">{dueReviews.length}</strong>
                  </p>
               </div>
               <button 
                 onClick={startSRSSession}
                 disabled={dueReviews.length === 0}
                 className="bg-[#41ffd1] hover:bg-[#34e5b9] text-black disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(65,255,209,0.2)] disabled:shadow-none whitespace-nowrap active:scale-95"
               >
                 Start
               </button>
            </div>

            {/* TAB NAVIGATION - Sleek Minimalist */}
            <div className="flex bg-[#121c2d] p-1 rounded-xl border border-gray-800">
              <button 
                onClick={() => setActiveTab("words")}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${activeTab === 'words' ? 'bg-[#1a2538] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Arsenal
              </button>
              <button 
                onClick={() => setActiveTab("mistakes")}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'mistakes' ? 'bg-[#1a2538] text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Hitlist 
                {mistakeWords.length > 0 && <span className="bg-red-500/20 border border-red-500/50 text-red-400 font-bold px-2 py-0.5 rounded-full text-[9px]">{mistakeWords.length}</span>}
              </button>
            </div>

            {/* VIEW A: WORDS LIST */}
            {activeTab === "words" && (
              <div className="space-y-4">
                <button 
                  onClick={triggerRandomChallenge}
                  className="w-full bg-[#1a2538] border border-[#41ffd1]/30 hover:border-[#41ffd1] text-[#41ffd1] py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(65,255,209,0.1)]"
                >
                  <Zap size={16} /> Random Deathmatch
                </button>

                <div className="flex items-center gap-3 py-2">
                  <div className="h-[1px] flex-1 bg-gray-800"></div>
                  <p className="text-center text-gray-500 font-bold uppercase tracking-widest text-[9px]">Select Target</p>
                  <div className="h-[1px] flex-1 bg-gray-800"></div>
                </div>

                {historyWords.length === 0 ? (
                  <div className="text-center text-gray-500 py-10 text-xs bg-[#121c2d] border border-gray-800 rounded-xl px-4">Arsenal is empty. Search to add weapons!</div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 justify-center max-h-[350px] overflow-y-auto pb-2 custom-scrollbar">
                    {historyWords.map((wordObj, i) => (
                      <button
                        key={i}
                        onClick={() => startNormalPracticeForWord(wordObj)}
                        className="bg-[#121c2d] border border-gray-800 hover:border-[#41ffd1]/50 hover:bg-[#1a2538] px-4 py-2.5 rounded-xl text-gray-300 hover:text-white font-bold text-sm transition-all transform active:scale-95"
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
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-1">
                  <div className="h-[1px] flex-1 bg-gray-800"></div>
                  <p className="text-center text-red-500/70 font-bold uppercase tracking-widest text-[9px]">Revenge Targets</p>
                  <div className="h-[1px] flex-1 bg-gray-800"></div>
                </div>

                {mistakeWords.length === 0 ? (
                  <div className="text-center text-[#41ffd1] py-12 text-sm bg-[#121c2d] border border-blue-900/30 rounded-xl px-4 flex flex-col items-center gap-3">
                    <Trophy size={32} className="text-yellow-500" />
                    Hitlist cleared! You are unstoppable.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pb-2 pr-1 custom-scrollbar">
                    {mistakeWords.map((item, i) => (
                      <div key={i} className="bg-[#121c2d] border border-gray-800 hover:border-red-900/50 rounded-xl flex items-center justify-between p-3.5 transition-all gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-900/20 text-red-400 flex items-center justify-center border border-red-900/50">
                             <Target size={14} />
                           </div>
                           <span className="text-white font-bold text-sm uppercase tracking-wider truncate">{item.word}</span>
                        </div>
                        <div className="flex gap-2 justify-end">
                           <button 
                             onClick={() => startMistakePracticeForWord(item.word)} 
                             className="bg-[#1a2538] hover:bg-red-900/30 hover:text-red-400 text-gray-400 border border-gray-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                           >
                             <Swords size={12} /> Fight
                           </button>
                           <button 
                             onClick={() => startClearChallenge(item.word)} 
                             className="bg-[#1a2538] hover:bg-[#41ffd1]/10 border border-gray-700 hover:border-[#41ffd1]/30 hover:text-[#41ffd1] text-gray-400 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1"
                           >
                             <CheckCircle2 size={12} /> Clear
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
          <div className="space-y-6 animate-fade-in">
            
            {/* Action Header */}
            <div className="flex flex-col gap-3 bg-[#121c2d] rounded-2xl p-4 border border-blue-900/50 shadow-lg">
              <div className="flex justify-between items-center w-full">
                <button 
                  onClick={() => { setSelectedWordObj(null); setCurrentChallenge(null); setIsReviewMode(false); setIsClearMode(false); fetchAllData(); }}
                  className="text-[10px] bg-[#1a2538] hover:bg-gray-700 text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest transition-colors"
                >
                  ◀ Abort
                </button>
                <div className="text-center flex-1 min-w-0 px-2">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-gray-500 block mb-1 truncate font-bold">
                    {isClearMode ? "BOSS BATTLE" : isReviewMode ? "REVENGE MODE" : "TRAINING GROUND"}
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className={`font-bold uppercase tracking-widest text-sm md:text-lg truncate max-w-[150px] ${isClearMode ? "text-yellow-500" : isReviewMode ? "text-red-400" : "text-[#41ffd1]"}`} title={selectedWordObj.word}>
                      {selectedWordObj.word}
                    </span>
                    <button 
                      onClick={() => playAudio(selectedWordObj.word)}
                      className="text-gray-400 hover:text-[#41ffd1] transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-black bg-[#41ffd1] px-3 py-1.5 rounded-lg shadow-sm">
                  {currentSentenceIndex + 1} / {practiceSentences.length}
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-[#0b101a] rounded-full overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-[#41ffd1] transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Translation Target */}
            <div className="bg-[#121c2d] border border-gray-800 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#41ffd1]/30"></div>
              <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-gray-500 block mb-3">Target Meaning:</span>
              <p className="text-xl font-semibold text-white leading-relaxed">
                "{currentChallenge.hindiSentence}"
              </p>
            </div>

            {/* Construction Zone */}
            <div className="min-h-[120px] bg-[#0b101a] border-2 border-dashed border-gray-700 hover:border-gray-500 transition-colors rounded-2xl p-5 flex flex-wrap gap-2 items-start content-start">
              {selectedWords.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-[11px] font-bold uppercase tracking-widest opacity-50 pt-8">
                  Assemble the Syntax
                </div>
              ) : (
                selectedWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordDeselect(wordObj)}
                    className="bg-[#121c2d] border border-[#41ffd1] px-4 py-2 rounded-xl text-white font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(65,255,209,0.1)]"
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
                    className="bg-[#1a2538] border border-gray-700 hover:border-[#41ffd1]/50 hover:bg-[#121c2d] hover:text-[#41ffd1] px-5 py-3 rounded-xl text-gray-200 font-bold text-sm transition-all shadow-sm transform active:scale-95"
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
                  className="w-full bg-[#41ffd1] hover:bg-[#34e5b9] text-black disabled:opacity-50 disabled:bg-[#1a2538] disabled:text-gray-500 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-lg"
                >
                  Submit Sequence
                </button>
              )}

              {isCorrect === false && (
                <div className="bg-[#121c2d] border border-red-900/50 rounded-2xl p-5 text-center shadow-lg animate-fade-in">
                   <p className="text-red-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 flex justify-center items-center gap-2"><XCircle size={16} /> Syntax Error</p>
                   <div className="flex items-center justify-center gap-3 bg-[#0b101a] py-3 px-4 rounded-xl mb-5 border border-gray-800">
                     <p className="text-lg text-white font-semibold break-words w-full text-center">{currentChallenge.englishSentence}</p>
                     <button onClick={() => playAudio(currentChallenge.englishSentence)} className="p-2 rounded-full bg-[#1a2538] hover:text-[#41ffd1] text-gray-400 transition-colors">
                       <Volume2 size={16} />
                     </button>
                   </div>
                   <button 
                     onClick={handleNextSentence} 
                     className="w-full bg-[#1a2538] hover:bg-gray-700 text-white border border-gray-600 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95"
                   >
                     Acknowledge & Continue
                   </button>
                </div>
              )}

              {isCorrect === true && !isClearMode && (
                <>
                  {!isReviewMode ? (
                    <div className="bg-[#121c2d] border border-[#41ffd1]/30 rounded-2xl p-5 text-center space-y-4 shadow-lg animate-fade-in">
                      <p className="text-[#41ffd1] text-xs font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-2"><CheckCircle2 size={16} /> Perfect Execution</p>
                      <button 
                        onClick={handleNextSentence} 
                        className="w-full bg-[#41ffd1] hover:bg-[#34e5b9] text-black py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_0_15px_rgba(65,255,209,0.2)]"
                      >
                        Next Target
                      </button>
                    </div>
                  ) : (
                    <div className="bg-[#121c2d] border border-blue-900/50 rounded-2xl p-5 text-center space-y-4 shadow-lg">
                       <p className="text-[#41ffd1] text-xs font-bold uppercase tracking-[0.2em] flex justify-center items-center gap-2"><CheckCircle2 size={16} /> Hit Confirmed</p>
                       <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest">Select Memory Interval:</p>
                       <div className="grid grid-cols-4 gap-2">
                          <button onClick={() => handleAnkiReview('again')} className="flex flex-col items-center py-3 bg-[#0b101a] hover:border-red-500/50 text-gray-400 border border-gray-800 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-bold">Again</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1 text-red-400">&lt;10m</span>
                          </button>
                          <button onClick={() => handleAnkiReview('hard')} className="flex flex-col items-center py-3 bg-[#0b101a] hover:border-yellow-500/50 text-gray-400 border border-gray-800 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-bold">Hard</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1 text-yellow-500">1d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('good')} className="flex flex-col items-center py-3 bg-[#0b101a] hover:border-[#41ffd1]/50 text-gray-400 border border-gray-800 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-bold text-[#41ffd1]">Good</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1 text-[#41ffd1]">3d</span>
                          </button>
                          <button onClick={() => handleAnkiReview('easy')} className="flex flex-col items-center py-3 bg-[#0b101a] hover:border-blue-500/50 text-gray-400 border border-gray-800 rounded-xl transition-all active:scale-95">
                            <span className="text-[10px] uppercase font-bold">Easy</span>
                            <span className="text-[8px] opacity-70 font-bold mt-1 text-blue-400">5d+</span>
                          </button>
                       </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* 🔥 SCREEN 3: RANDOM FLASHCARD ZONE */}
        {isRandomMode && randomWordInfo && (
          <div className="space-y-6 animate-fade-in w-full max-w-xl mx-auto">
            <div className="flex justify-between items-center bg-[#121c2d] rounded-2xl p-4 border border-blue-900/50 shadow-lg">
              <button 
                onClick={() => { setIsRandomMode(false); setRandomWordInfo(null); }}
                className="text-[10px] bg-[#1a2538] hover:bg-gray-700 text-gray-400 border border-gray-700 px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-all"
              >
                ◀ Abort
              </button>
              <div className="text-center flex items-center justify-center gap-2">
                <span className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold block">
                  SPEED RECALL
                </span>
                <span className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></span>
              </div>
              <div className="w-[70px]"></div>
            </div>

            <div className="bg-[#121c2d] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl min-h-[350px] flex flex-col justify-center items-center relative overflow-hidden">
              
              {/* Cyan Glow backdrop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#41ffd1]/5 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center w-full">
                
                <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wide mb-4 capitalize">
                  <ScrambleText text={randomWordInfo.word} />
                </h2>
                
                <div className="flex items-center gap-3 mb-8 justify-center">
                  {randomWordInfo.pronunciation && (
                    <p className="text-sm text-gray-400 font-medium italic">
                      /{randomWordInfo.pronunciation}/
                    </p>
                  )}
                  <button 
                    onClick={() => playAudio(randomWordInfo.word)}
                    className="w-10 h-10 rounded-full bg-[#1a2538] hover:text-[#41ffd1] text-gray-300 flex items-center justify-center transition-all border border-gray-700 active:scale-95"
                  >
                    <Volume2 size={18} />
                  </button>
                </div>

                {!showRandomAnswer ? (
                  <button
                    onClick={() => setShowRandomAnswer(true)}
                    className="bg-[#1a2538] hover:bg-gray-700 border border-gray-600 text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all w-full max-w-[280px] flex items-center justify-center gap-2"
                  >
                    <Eye size={16} /> Reveal Target
                  </button>
                ) : (
                  <div className="animate-fade-in w-full flex flex-col items-center max-w-md">
                    <div className="w-full h-[1px] bg-gray-800 mb-6"></div>
                    
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#41ffd1] block mb-3">
                      Intel (Meaning):
                    </span>
                    <p className="text-xl font-bold text-white leading-relaxed bg-[#0b101a] px-6 py-5 rounded-2xl border border-gray-800 w-full shadow-inner break-words">
                      {randomWordInfo.meaning || randomWordInfo.hindiMeaning || "Meaning not available in DB"}
                    </p>
                    
                    <button
                        onClick={triggerRandomChallenge}
                        className="mt-8 w-full max-w-[300px] bg-[#41ffd1] hover:bg-[#34e5b9] text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all transform active:scale-95 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(65,255,209,0.2)]"
                    >
                        <RefreshCw size={16} /> Next Target
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