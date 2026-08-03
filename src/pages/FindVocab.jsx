import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import toast, { Toaster } from "react-hot-toast";
import { Capacitor } from '@capacitor/core';
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
  Eye,
  Search,
  Bot 
} from "lucide-react";

// Cash Count / Rolling Number Animation
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

// Slot Machine / Scramble Text Animation
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
  const navigate = useNavigate(); 

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

  // AI TUTOR STATES
  const [userAttempt, setUserAttempt] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // 🔥 PREMIUM AUDIO REF (Perfectly manage play/pause)
  const activeAudioRef = useRef(null);

  const [flippedCards, setFlippedCards] = useState({});
  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const API_URL = Capacitor.isNativePlatform() 
    ? "https://serdeptry1st.onrender.com" 
    : (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com");

  useEffect(() => {
    const loggedInUserEmail = localStorage.getItem("eng_userEmail");
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail.trim());
    } else {
      setUserEmail("guest_user@gmail.com");
    }

    // Component unmount hone par audio stop karne ke liye
    return () => {
      stopPremiumAudio();
    };
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

  // Premium audio stop karne ka helper function
  const stopPremiumAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setIsAiSpeaking(false);
  };

  const playAudio = (text) => {
    stopPremiumAudio(); // AI bol raha ho toh use chup karao

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop default TTS 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Audio not supported in this browser!");
    }
  };

  // 🔥 NAYA FUNCTION: Backend Se MP3 Audio Manga Kar Play Karega (Gemini Style)
  const playAiVoice = async (text) => {
    stopPremiumAudio(); // Purana clear karo
    setIsAiSpeaking(true);

    try {
      const response = await fetch(`${API_URL}/api/words/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();

      if (data.success && data.audioBase64) {
        // MP3 Base64 ko audio object me load karo
        const audio = new Audio("data:audio/mp3;base64," + data.audioBase64);
        activeAudioRef.current = audio;
        
        audio.play();

        audio.onended = () => {
          setIsAiSpeaking(false);
          activeAudioRef.current = null;
        };
        
        audio.onerror = () => {
          setIsAiSpeaking(false);
          toast.error("Audio load nahi ho payi!");
        };
      } else {
        setIsAiSpeaking(false);
      }
    } catch (error) {
      console.error("Premium Audio fetch error:", error);
      setIsAiSpeaking(false);
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
    
    // Naya question aane par AI Explanation clear aur audio cancel
    setAiExplanation("");
    setUserAttempt("");
    stopPremiumAudio();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

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
    setUserAttempt(userSentence); 

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

  // 🔥 AI EXPLANATION FETCH & SPEAK
  const fetchAiExplanation = async () => {
    if (!currentChallenge || !userAttempt) return;
    
    setIsExplaining(true);
    setAiExplanation("");
    stopPremiumAudio();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    try {
      const response = await fetch(`${API_URL}/api/words/grammar-explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctSentence: currentChallenge.englishSentence,
          userSentence: userAttempt
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setAiExplanation(data.explanation);
        // Jaise hi data aaye, Backend Route se Premium Voice play karo
        playAiVoice(data.explanation); 
      } else {
        toast.error("AI is busy right now.");
      }
    } catch (error) {
      toast.error("Failed to fetch explanation.");
    } finally {
      setIsExplaining(false);
    }
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
    // 👈 NAYA TARGET AANE PAR CHUP KARA DO
    stopPremiumAudio();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    setAiExplanation("");
    setUserAttempt("");

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
    <>
      <style>
        {`
          .flip-card { perspective: 1000px; }
          .flip-card-inner {
            transform-style: preserve-3d;
            transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
          }
          .flip-card-flipped { transform: rotateY(180deg); }
          .flip-card-front, .flip-card-back {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          .flip-card-back { transform: rotateY(180deg); }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
      <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex flex-col items-center p-4 py-8 font-sans overflow-x-hidden transition-colors duration-500 pb-28">
        <Toaster position="top-center" toastOptions={{ style: { background: '#8B004A', color: '#F2EFE7', border: 'none', fontWeight: 'bold' } }} />

        {!isRandomMode && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in duration-300">
            
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-[#8B004A] tracking-wide uppercase">
                Training Arena
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-black opacity-80">
                Syntax & Recall Engine
              </p>
            </div>

            {/* SCOREBOARD */}
            <div className="w-full bg-white border-2 border-gray-100 rounded-[2rem] p-6 mb-8 shadow-xl shadow-gray-200/50">
              <div className="flex justify-between items-center gap-2">
                <div className="text-center flex-1 border-r-2 border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1.5">Accuracy</p>
                    <p className={`text-2xl font-black ${accuracy >= 80 ? 'text-[#8B004A]' : accuracy >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                      <AnimatedNumber value={accuracy} />%
                    </p>
                </div>
                <div className="text-center flex-1 border-r-2 border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1.5">Practiced</p>
                    <p className="text-2xl font-black text-gray-800">
                      <AnimatedNumber value={userStats.totalPracticed} />
                    </p>
                </div>
                <div className="text-center flex-1 border-r-2 border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1.5">Errors</p>
                    <p className="text-2xl font-black text-gray-400">
                      <AnimatedNumber value={userStats.totalMistakes} />
                    </p>
                </div>
                <div className="text-center flex-1">
                    <p className="text-[10px] text-orange-400 uppercase tracking-widest font-black mb-1.5">Streak</p>
                    <p className="text-2xl font-black text-orange-500 flex items-center justify-center gap-1.5">
                      <AnimatedNumber value={comboStreak} /> <Flame size={18} strokeWidth={3} />
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
              {/* SRS Active Banner */}
              <div className="bg-[#8B004A] border-4 border-white/40 p-5 rounded-3xl flex justify-between items-center shadow-lg shadow-[#8B004A]/20">
                 <div className="flex-1 mr-2">
                    <h3 className="text-white font-black text-base mb-1 flex items-center gap-2 tracking-wide">
                      <BrainCircuit size={18} strokeWidth={2.5} /> Daily Quests
                    </h3>
                    <p className="text-[#F2EFE7]/80 text-xs font-bold uppercase tracking-widest mt-1.5">
                      Pending: <strong className="text-[#8B004A] ml-1 bg-white px-2 py-0.5 rounded shadow-sm">{dueReviews.length}</strong>
                    </p>
                 </div>
                 <button 
                   onClick={startSRSSession}
                   disabled={dueReviews.length === 0}
                   className="bg-white hover:bg-[#F2EFE7] text-[#8B004A] disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 whitespace-nowrap"
                 >
                   Execute
                 </button>
              </div>

              {/* TAB NAVIGATION */}
              <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm mt-4">
                <button 
                  onClick={() => setActiveTab("words")}
                  className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'words' ? 'bg-[#8B004A] text-white shadow-md' : 'text-gray-500 hover:text-[#8B004A] hover:bg-gray-50'}`}
                >
                  Arsenal
                </button>
                <button 
                  onClick={() => setActiveTab("mistakes")}
                  className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'mistakes' ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}
                >
                  Hitlist 
                  {mistakeWords.length > 0 && <span className="bg-red-500 text-white font-black px-2 py-0.5 rounded-md text-[9px] shadow-sm">{mistakeWords.length}</span>}
                </button>
              </div>

              {/* VIEW A: WORDS LIST */}
              {activeTab === "words" && (
                <div className="space-y-5 pt-2">
                  <button 
                    onClick={triggerRandomChallenge}
                    className="w-full bg-[#8B004A] hover:bg-[#6a0038] text-white py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-[#8B004A]/20 border-none"
                  >
                    <Zap size={18} strokeWidth={2.5} /> Random Deathmatch
                  </button>

                  <div className="w-full mt-4">
                    <div className="bg-white border-[3px] border-[#8B004A]/20 rounded-3xl p-5 sm:p-6 shadow-xl shadow-[#8B004A]/10 relative w-full overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-[#8B004A]"></div>
                      
                      <div className="flex items-center gap-3 mb-5">
                        <div className="bg-[#8B004A]/10 p-2.5 rounded-xl text-[#8B004A]">
                           <Target size={20} strokeWidth={3} />
                        </div>
                        <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em]">Select Specific Target</h4>
                      </div>
                      
                      {historyWords.length === 0 ? (
                        <p className="text-center text-sm font-black text-gray-400 py-8 uppercase tracking-wider">Arsenal is empty. Search to add weapons!</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                          {historyWords.map((item, i) => (
                            <div key={item._id || i} className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-2xl p-1.5 shadow-sm hover:border-[#8B004A]/30 hover:shadow-md transition-shadow w-full">
                              
                              {/* FLIP AREA */}
                              <div 
                                className="flip-card flex-1 h-[56px] cursor-pointer"
                                onClick={() => toggleFlip(item._id || item.word)}
                              >
                                <div className={`flip-card-inner w-full h-full relative ${flippedCards[item._id || item.word] ? 'flip-card-flipped' : ''}`}>
                                  
                                  {/* FRONT */}
                                  <div className="flip-card-front absolute w-full h-full bg-[#F2EFE7] hover:bg-[#E01A76]/10 rounded-xl px-4 flex items-center justify-between border border-transparent transition-colors">
                                    <span className="text-gray-900 text-sm font-black tracking-wide truncate">
                                      {item.word} {item.imageUrl && "🖼️"}
                                    </span>
                                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-white px-1.5 py-0.5 rounded shadow-sm">
                                      Tap
                                    </span>
                                  </div>

                                  {/* BACK */}
                                  <div className="flip-card-back absolute w-full h-full bg-[#8B004A] text-white rounded-xl px-3 flex items-center justify-center shadow-inner">
                                    <span className="text-xs font-bold text-center line-clamp-2 leading-tight w-full">
                                      {item.meaning || "Ready for training"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* STATIC ACTIONS AREA */}
                              <div className="flex flex-row gap-1.5 flex-shrink-0">
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate('/home', { state: { targetWord: item.word } }); 
                                  }}
                                  className="bg-gray-50 hover:bg-[#8B004A] text-[#8B004A] hover:text-white h-[56px] w-[46px] rounded-xl transition-all shadow-sm active:scale-95 border border-gray-100 flex items-center justify-center group"
                                  title="Analyze"
                                >
                                  <Search size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                </button>
                                
                                <button
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    startNormalPracticeForWord(item);
                                  }}
                                  className="bg-gray-900 hover:bg-[#E01A76] text-white h-[56px] w-[46px] rounded-xl transition-all shadow-sm active:scale-95 border border-transparent flex items-center justify-center group"
                                  title="Practice"
                                >
                                  <Swords size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                </button>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW B: MISTAKES TAB */}
              {activeTab === "mistakes" && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3 py-2 opacity-60">
                    <div className="h-[2px] flex-1 bg-red-200 rounded-full"></div>
                    <p className="text-center text-red-500 font-black uppercase tracking-[0.2em] text-[10px]">Revenge Targets</p>
                    <div className="h-[2px] flex-1 bg-red-200 rounded-full"></div>
                  </div>

                  {mistakeWords.length === 0 ? (
                    <div className="text-center text-[#8B004A] py-14 text-sm bg-white border-2 border-gray-100 rounded-3xl px-4 flex flex-col items-center gap-4 shadow-sm font-black tracking-wider">
                      <div className="bg-yellow-50 p-4 rounded-full">
                        <Trophy size={40} className="text-yellow-500" strokeWidth={2} />
                      </div>
                      HITLIST CLEARED! YOU ARE UNSTOPPABLE.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pb-4 pr-1 custom-scrollbar">
                      {mistakeWords.map((item, i) => (
                        <div key={i} className="bg-white border-2 border-gray-100 hover:border-red-300 rounded-2xl flex items-center justify-between p-4 transition-all gap-3 shadow-sm hover:shadow-md">
                          <div className="flex items-center gap-4 overflow-hidden">
                             <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm">
                               <Target size={20} strokeWidth={2.5} />
                             </div>
                             <span className="text-gray-900 font-black text-base uppercase tracking-wider truncate">{item.word}</span>
                          </div>
                          <div className="flex gap-2 justify-end">
                             <button 
                               onClick={() => startMistakePracticeForWord(item.word)} 
                               className="bg-red-50 hover:bg-red-500 hover:text-white text-red-600 border border-red-100 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                             >
                               <Swords size={14} /> Fight
                             </button>
                             <button 
                               onClick={() => startClearChallenge(item.word)} 
                               className="bg-gray-50 hover:bg-[#8B004A] border border-gray-100 hover:border-[#8B004A] hover:text-white text-gray-500 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                             >
                               <CheckCircle2 size={14} /> Clear
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
              <div className="flex flex-col gap-4 bg-white rounded-[2rem] p-5 border-2 border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex justify-between items-center w-full">
                  <button 
                    onClick={() => { stopPremiumAudio(); setSelectedWordObj(null); setCurrentChallenge(null); setIsReviewMode(false); setIsClearMode(false); fetchAllData(); }}
                    className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#8B004A] border border-gray-200 px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-colors shadow-sm active:scale-95"
                  >
                    ◀ Abort
                  </button>
                  <div className="text-center flex-1 min-w-0 px-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-1 truncate font-black">
                      {isClearMode ? "BOSS BATTLE" : isReviewMode ? "REVENGE MODE" : "TRAINING GROUND"}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`font-black uppercase tracking-widest text-lg md:text-xl truncate max-w-[150px] ${isClearMode ? "text-orange-500" : isReviewMode ? "text-red-500" : "text-[#8B004A]"}`} title={selectedWordObj.word}>
                        {selectedWordObj.word}
                      </span>
                      <button 
                        onClick={() => playAudio(selectedWordObj.word)}
                        className="text-gray-400 hover:text-[#8B004A] transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full border border-gray-200 shadow-sm"
                      >
                        <Volume2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-black text-white bg-[#8B004A] px-3.5 py-2 rounded-xl shadow-md tracking-wider">
                    {currentSentenceIndex + 1} / {practiceSentences.length}
                  </div>
                </div>
                
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className="h-full bg-[#8B004A] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Translation Target */}
              <div className="bg-white border-l-[6px] border-l-[#8B004A] rounded-2xl p-6 md:p-8 shadow-xl shadow-gray-200/50">
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#8B004A]/60 block mb-3">Target Meaning:</span>
                <p className="text-xl md:text-2xl font-black text-gray-900 leading-relaxed">
                  "{currentChallenge.hindiSentence}"
                </p>
              </div>

              {/* Construction Zone */}
              <div className="min-h-[140px] bg-[#F2EFE7] border-2 border-dashed border-[#8B004A]/30 rounded-3xl p-6 flex flex-wrap gap-2.5 items-start content-start shadow-inner">
                {selectedWords.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase tracking-[0.2em] pt-8 opacity-70">
                    Assemble the Syntax
                  </div>
                ) : (
                  selectedWords.map((wordObj) => (
                    <button
                      key={wordObj.id}
                      onClick={() => handleWordDeselect(wordObj)}
                      className="bg-[#8B004A] border-2 border-[#8B004A] px-5 py-2.5 rounded-xl text-white font-black text-sm transition-all transform hover:scale-105 active:scale-95 shadow-md shadow-[#8B004A]/30"
                    >
                      {wordObj.text}
                    </button>
                  ))
                )}
              </div>

              {/* Word Pool */}
              {isCorrect === null && (
                <div className="flex flex-wrap gap-3 justify-center pt-2">
                  {availableWords.map((wordObj) => (
                    <button
                      key={wordObj.id}
                      onClick={() => handleWordSelect(wordObj)}
                      className="bg-white border-2 border-gray-200 hover:border-[#8B004A] hover:bg-[#8B004A] hover:text-white px-6 py-3.5 rounded-xl text-[#8B004A] font-black text-sm transition-all shadow-sm transform active:scale-95"
                    >
                      {wordObj.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions Dashboard */}
              <div className="pt-6 flex flex-col gap-4">
                {isCorrect === null && (
                  <button
                    onClick={checkAnswer}
                    disabled={selectedWords.length === 0}
                    className="w-full bg-[#8B004A] hover:bg-[#6a0038] text-white disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-xl shadow-[#8B004A]/20 border-none"
                  >
                    Submit Sequence
                  </button>
                )}

                {/* 🔥 AI EXPLANATION / ERROR BLOCK */}
                {isCorrect === false && (
                  <div className="bg-white border-[3px] border-red-100 rounded-3xl p-6 text-center shadow-xl animate-fade-in">
                     <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-4 flex justify-center items-center gap-2"><XCircle size={20} strokeWidth={3} /> Syntax Error</p>
                     
                     <div className="flex items-center justify-center gap-3 bg-red-50 py-4 px-5 rounded-2xl mb-6 border border-red-100 shadow-inner">
                       <p className="text-lg text-gray-900 font-black break-words w-full text-center">{currentChallenge.englishSentence}</p>
                       <button onClick={() => playAudio(currentChallenge.englishSentence)} className="p-2.5 rounded-full bg-white border border-red-100 hover:bg-red-100 text-red-500 shadow-sm transition-colors shrink-0">
                         <Volume2 size={18} strokeWidth={2.5} />
                       </button>
                     </div>

                     {/* AI TUTOR SECTION */}
                     {aiExplanation ? (
                       <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl mb-6 text-sm text-left flex gap-3 shadow-sm animate-fade-in relative overflow-hidden">
                         <div className="relative shrink-0 mt-0.5">
                           <Bot size={24} className={`transition-colors ${isAiSpeaking ? 'text-blue-600' : 'text-blue-400'}`} />
                           {/* Sound wave dot indicator when AI is speaking */}
                           {isAiSpeaking && (
                             <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                             </span>
                           )}
                         </div>
                         <div>
                           <p className="font-black text-blue-700 mb-1 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                             AI Tutor Explanation {isAiSpeaking && <span className="text-[9px] lowercase italic text-blue-400 font-medium">(Speaking...)</span>}
                           </p>
                           <p className="font-medium leading-relaxed">{aiExplanation}</p>
                         </div>
                       </div>
                     ) : (
                       <button 
                         onClick={fetchAiExplanation}
                         disabled={isExplaining}
                         className="mb-6 w-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                       >
                         {isExplaining ? <RefreshCw className="animate-spin" size={16} /> : <Bot size={18} />}
                         {isExplaining ? "Analyzing Error..." : "Ask AI Tutor"}
                       </button>
                     )}

                     <button 
                       onClick={handleNextSentence} 
                       className="w-full bg-red-500 hover:bg-red-600 text-white border-none py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-md"
                     >
                       Acknowledge & Continue
                     </button>
                  </div>
                )}

                {isCorrect === true && !isClearMode && (
                  <>
                    {!isReviewMode ? (
                      <div className="bg-white border-[3px] border-green-100 rounded-3xl p-6 text-center space-y-5 shadow-xl animate-fade-in">
                        <p className="text-green-500 text-xs font-black uppercase tracking-[0.2em] flex justify-center items-center gap-2"><CheckCircle2 size={20} strokeWidth={3} /> Perfect Execution</p>
                        <button 
                          onClick={handleNextSentence} 
                          className="w-full bg-[#8B004A] hover:bg-[#6a0038] text-white py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-[#8B004A]/30 border-none"
                        >
                          Next Target
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border-[3px] border-gray-100 rounded-3xl p-6 text-center space-y-5 shadow-xl">
                         <p className="text-[#8B004A] text-xs font-black uppercase tracking-[0.2em] flex justify-center items-center gap-2"><CheckCircle2 size={20} strokeWidth={3} /> Hit Confirmed</p>
                         <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Select Memory Interval:</p>
                         <div className="grid grid-cols-4 gap-2.5">
                            <button onClick={() => handleAnkiReview('again')} className="flex flex-col items-center py-4 bg-white hover:bg-red-50 text-red-500 border-2 border-gray-100 hover:border-red-200 rounded-2xl transition-all active:scale-95 shadow-sm">
                              <span className="text-[11px] uppercase font-black">Again</span>
                              <span className="text-[9px] font-bold mt-1 text-red-400">&lt;10m</span>
                            </button>
                            <button onClick={() => handleAnkiReview('hard')} className="flex flex-col items-center py-4 bg-white hover:bg-orange-50 text-orange-500 border-2 border-gray-100 hover:border-orange-200 rounded-2xl transition-all active:scale-95 shadow-sm">
                              <span className="text-[11px] uppercase font-black">Hard</span>
                              <span className="text-[9px] font-bold mt-1 text-orange-400">1d</span>
                            </button>
                            <button onClick={() => handleAnkiReview('good')} className="flex flex-col items-center py-4 bg-white hover:bg-[#F2EFE7] hover:border-[#8B004A] text-[#8B004A] border-2 border-gray-100 rounded-2xl transition-all active:scale-95 shadow-sm">
                              <span className="text-[11px] uppercase font-black">Good</span>
                              <span className="text-[9px] font-bold mt-1 text-gray-500">3d</span>
                            </button>
                            <button onClick={() => handleAnkiReview('easy')} className="flex flex-col items-center py-4 bg-white hover:bg-blue-50 text-blue-500 border-2 border-gray-100 hover:border-blue-200 rounded-2xl transition-all active:scale-95 shadow-sm">
                              <span className="text-[11px] uppercase font-black">Easy</span>
                              <span className="text-[9px] font-bold mt-1 text-blue-400">5d+</span>
                            </button>
                         </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* SCREEN 3: RANDOM FLASHCARD ZONE */}
          {isRandomMode && randomWordInfo && (
            <div className="space-y-6 animate-fade-in w-full max-w-xl mx-auto mt-6">
              <div className="flex justify-between items-center bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-md">
                <button 
                  onClick={() => { setIsRandomMode(false); setRandomWordInfo(null); }}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-[#8B004A] border border-gray-200 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                >
                  ◀ Abort
                </button>
                <div className="text-center flex items-center justify-center gap-2">
                  <span className="animate-pulse w-2 h-2 bg-[#8B004A] rounded-full"></span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-[#8B004A] font-black block">
                    SPEED RECALL
                  </span>
                  <span className="animate-pulse w-2 h-2 bg-[#8B004A] rounded-full"></span>
                </div>
                <div className="w-[75px]"></div>
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 text-center shadow-2xl min-h-[380px] flex flex-col justify-center items-center relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center w-full">
                  <h2 className="text-5xl md:text-6xl font-black text-[#8B004A] tracking-wider mb-6 capitalize drop-shadow-sm">
                    <ScrambleText text={randomWordInfo.word} />
                  </h2>
                  
                  <div className="flex items-center gap-3 mb-10 justify-center">
                    {randomWordInfo.pronunciation && (
                      <p className="text-sm text-gray-500 font-bold italic bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full shadow-sm">
                        /{randomWordInfo.pronunciation}/
                      </p>
                    )}
                    <button 
                      onClick={() => playAudio(randomWordInfo.word)}
                      className="w-12 h-12 rounded-full bg-[#F2EFE7] hover:bg-[#8B004A] text-[#8B004A] hover:text-white flex items-center justify-center transition-all shadow-md active:scale-90 border-none"
                    >
                      <Volume2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>

                  {!showRandomAnswer ? (
                    <button
                      onClick={() => setShowRandomAnswer(true)}
                      className="bg-[#8B004A] hover:bg-[#6a0038] text-white border-none px-10 py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all w-full max-w-[280px] flex items-center justify-center gap-2.5 shadow-xl shadow-[#8B004A]/20 active:scale-95"
                    >
                      <Eye size={18} strokeWidth={2.5} /> Reveal Target
                    </button>
                  ) : (
                    <div className="animate-fade-in w-full flex flex-col items-center max-w-md">
                      <div className="w-16 h-[3px] bg-gray-200 mb-6 rounded-full"></div>
                      
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400 block mb-3">
                        Intel (Meaning):
                      </span>
                      <p className="text-2xl font-black text-gray-900 leading-relaxed bg-[#F2EFE7] px-6 py-6 rounded-3xl border-2 border-[#8B004A]/10 w-full shadow-inner break-words">
                        {randomWordInfo.meaning || randomWordInfo.hindiMeaning || "Meaning not available in DB"}
                      </p>
                      
                      <button
                          onClick={triggerRandomChallenge}
                          className="mt-8 w-full max-w-[280px] bg-gray-900 hover:bg-black text-white py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 flex justify-center items-center gap-2.5 shadow-xl border-none"
                      >
                          <RefreshCw size={16} strokeWidth={2.5} /> Next Target
                      </button> 
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}