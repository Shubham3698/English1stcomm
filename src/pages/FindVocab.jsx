import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function PracticePage() {
  const [userEmail, setUserEmail] = useState("");
  const [historyWords, setHistoryWords] = useState([]);
  
  // Game States
  const [isLoading, setIsLoading] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Naya state correct answer expand/collapse karne ke liye
  const [showAnswer, setShowAnswer] = useState(false);

  const API_URL =
    window.location.hostname === "localhost"
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

  // 1. Pehle user ki history fetch karo
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userEmail || userEmail === "guest_user@gmail.com") return;
      try {
        const response = await fetch(`${API_URL}/api/words/history/${encodeURIComponent(userEmail)}`);
        const resData = await response.json();
        if (response.ok && resData.success && resData.data.length > 0) {
          const wordsOnly = resData.data.map(item => item.word);
          setHistoryWords(wordsOnly);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      }
    };
    fetchHistory();
  }, [userEmail]);

  // 2. Ek random word uthao aur Gemini se game generate karwao
  const generateNewChallenge = async () => {
    if (historyWords.length === 0) {
      return toast.error("Pehle Vocab page pe jaake kuch words search karo! 📚");
    }

    setIsLoading(true);
    setIsCorrect(null);
    setSelectedWords([]);
    setShowAnswer(false);

    const randomTargetWord = historyWords[Math.floor(Math.random() * historyWords.length)];

    try {
      const response = await fetch(`${API_URL}/api/words/generate-practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: randomTargetWord, userId: userEmail }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const data = resData.data;
        setCurrentChallenge(data);

        const correctWordsArr = data.englishSentence.split(" ");
        let combinedWords = [...correctWordsArr, ...data.distractors];
        
        combinedWords = combinedWords.sort(() => Math.random() - 0.5);
        
        const wordObjects = combinedWords.map((word, index) => ({
          id: `word-${index}`,
          text: word
        }));

        setAvailableWords(wordObjects);
      } else {
        toast.error("Challenge load nahi hua!");
      }
    } catch (error) {
      toast.error("Backend server error!");
    } finally {
      setIsLoading(false);
    }
  };

  // Word interactions
  const handleWordSelect = (wordObj) => {
    setAvailableWords(availableWords.filter(w => w.id !== wordObj.id));
    setSelectedWords([...selectedWords, wordObj]);
  };

  const handleWordDeselect = (wordObj) => {
    setSelectedWords(selectedWords.filter(w => w.id !== wordObj.id));
    setAvailableWords([...availableWords, wordObj]);
  };

  // Check the answer
  const checkAnswer = () => {
    if (!currentChallenge) return;
    const userSentence = selectedWords.map(w => w.text).join(" ").trim().toLowerCase();
    const correctSentence = currentChallenge.englishSentence.trim().toLowerCase();

    if (userSentence === correctSentence) {
      setIsCorrect(true);
      toast.success("Bilkul Sahi! Sateek Jawab 🎉");
    } else {
      setIsCorrect(false);
      setShowAnswer(false); // Result aate hi pehle hide rakho
      toast.error("Thoda gadbad hai, wapas try karo! 😅");
    }
  };

  // Popup close karne ka function
  const closePopup = () => {
    setIsCorrect(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col items-center p-4 py-10">
      <Toaster position="top-center" />

      {/* Title branding */}
      <div className="text-center space-y-1 mb-8">
        <h2 className="text-2xl font-black italic uppercase bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
          🎮 Dameeto Syntax Builder
        </h2>
        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
          AI-Driven Structural Practice
        </p>
      </div>

      <div className="w-full max-w-xl bg-[#0b0b0e] border border-white/[0.05] rounded-[2.5rem] p-6 shadow-2xl">
        
        {!currentChallenge && !isLoading && (
          <div className="text-center py-10 space-y-4">
            <p className="text-slate-400 text-sm font-medium">
              Tumhari saved vocabulary history se sentence building practice karo.
            </p>
            <button
              onClick={generateNewChallenge}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-90 active:scale-95 px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-950/20"
            >
              🚀 Start Practice
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest animate-pulse">
              Structuring New Challenge...
            </p>
          </div>
        )}

        {currentChallenge && !isLoading && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Hindi Question */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 block mb-2">Translate This:</span>
              <p className="text-lg md:text-xl font-medium text-white relative z-10">
                "{currentChallenge.hindiSentence}"
              </p>
            </div>

            {/* Answer Drop Zone (Selected Words) */}
            <div className="min-h-[80px] border-b-2 border-white/10 pb-4 flex flex-wrap gap-2 items-start content-start">
              {selectedWords.length === 0 ? (
                <span className="text-slate-600 text-sm italic mt-2 w-full text-center">
                  Words ko select karke yahan arrange karo...
                </span>
              ) : (
                selectedWords.map((wordObj) => (
                  <button
                    key={wordObj.id}
                    onClick={() => handleWordDeselect(wordObj)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-white font-medium text-sm transition-all shadow-sm active:scale-95"
                  >
                    {wordObj.text}
                  </button>
                ))
              )}
            </div>

            {/* Jumbled Words Pool */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              {availableWords.map((wordObj) => (
                <button
                  key={wordObj.id}
                  onClick={() => handleWordSelect(wordObj)}
                  className="bg-[#121216] hover:bg-cyan-900/40 border border-white/5 hover:border-cyan-500/50 px-5 py-3 rounded-xl text-slate-300 font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  {wordObj.text}
                </button>
              ))}
            </div>

            {/* Result & Actions */}
            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
              
              {/* STATUS POPUP */}
              {isCorrect !== null && (
                <div className={`relative p-5 rounded-2xl flex flex-col items-center gap-3 text-center font-bold text-sm transition-all duration-300 ${isCorrect ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  
                  {/* CLOSE BUTTON */}
                  <button 
                    onClick={closePopup}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-current transition-all active:scale-90"
                    title="Close"
                  >
                    ✕
                  </button>

                  <p className="mt-1 text-base">{isCorrect ? '🏆 Correct Translation! You nailed it.' : '❌ Oops! Sequence galat hai.'}</p>
                  
                  {/* EXPANDABLE CORRECT ANSWER SECTION */}
                  {!isCorrect && (
                    <div className="mt-1 w-full flex flex-col items-center">
                      <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="text-[10px] uppercase font-black tracking-widest text-rose-300 hover:text-rose-100 underline decoration-dashed underline-offset-4 transition-all duration-200"
                      >
                        {showAnswer ? "Hide Answer ⬆️" : "👀 Show Correct Answer"}
                      </button>
                      
                      {/* CAROUSEL / SLIDE-IN ANIMATION FOR ANSWER */}
                      <div 
                        className={`w-full overflow-hidden transition-all duration-500 ease-in-out transform ${
                          showAnswer 
                            ? "max-h-[200px] opacity-100 translate-y-0 scale-100 mt-4" 
                            : "max-h-0 opacity-0 -translate-y-4 scale-95 mt-0"
                        }`}
                      >
                        <div className="p-4 bg-gradient-to-r from-rose-950/40 to-black/60 border border-rose-500/30 rounded-xl w-full text-white font-medium shadow-2xl relative">
                          <span className="text-rose-400 text-[9px] uppercase tracking-widest block mb-2 opacity-80">
                            Exact Translation:
                          </span>
                          <p className="text-lg tracking-wider text-rose-50">
                            {currentChallenge.englishSentence}
                          </p>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={checkAnswer}
                  disabled={selectedWords.length === 0}
                  className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  Verify Answer
                </button>
                <button
                  onClick={generateNewChallenge}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  Next Challenge ⏭️
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}