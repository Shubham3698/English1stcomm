import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function NeuralVocabStudio() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1); 
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState(new Set());
  const [hasFinishedQuiz, setHasFinishedQuiz] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const wordData = { 
    word: "Withered",
    step1: {
      question: "Kya aapne 'Withered' word pehle kabhi suna hai?",
      options: ["Ekdam naya hai", "Haan, suna-suna lagta hai", "Daily life wala word hai"],
    },
    step2: {
      question: "Final Test: 'Withered' ka sahi matlab kya hai?",
      options: ["Murjhaya hua / Sookha hua", "Bahut gussa", "Tezi se bhagna"],
      correct: 0
    }
  };

  const playAudio = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: 'KjiNUjzziQs',
        playerVars: { 'controls': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 
          'onStateChange': onPlayerStateChange 
        }
      });
    };
    return () => clearInterval(intervalRef.current);
  }, []);

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTracking();
    } else if (event.data === window.YT.PlayerState.ENDED && !hasFinishedQuiz) {
      clearInterval(intervalRef.current);
      triggerFinalQuiz();
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const startTracking = () => {
    intervalRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const current = Math.floor(playerRef.current.getCurrentTime());
        if (current === 4 && !showQuiz && !triggeredQuizzes.has(4)) {
          playerRef.current.pauseVideo();
          setCurrentQuestion(wordData);
          setQuizStep(1); 
          setShowQuiz(true);
          setTriggeredQuizzes(prev => new Set(prev).add(4));
        }
      }
    }, 500);
  };

  const triggerFinalQuiz = () => {
    setCurrentQuestion(wordData);
    setQuizStep(2);
    setShowQuiz(true);
    playAudio(wordData.word);
  };

  // 🔥 FIX 1: Step 1 ke liye bhi Jump logic add kiya
  const handleStep1 = () => {
    toast.success("Noted! Last mein test hoga.");
    setShowQuiz(false);
    
    // Jump video forward by 1.2s to prevent immediate re-trigger
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime + 1.2); 
    playerRef.current.playVideo();
  };

  // 🔥 FIX 2: Step 2 ka success logic
  const handleStep2 = (idx) => {
    if (idx === currentQuestion.step2.correct) {
      toast.success("Shabaash! Lesson Completed. ✨");
      setShowQuiz(false);
      setHasFinishedQuiz(true); 
      
      // Video khatam ho chuki hai, par extra safety ke liye
      playerRef.current.playVideo(); 
    } else {
      toast.error("Galti kar di! Pronunciation suno.");
      playAudio(currentQuestion.word);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <Toaster position="top-center" />

      <div className="relative w-full max-w-[380px] aspect-[9/19] bg-[#0a0a0c] rounded-[3.5rem] p-3 border-[6px] border-[#1a1a1f] shadow-2xl overflow-hidden">
        <div id="player" className="w-full h-full rounded-[2.8rem] overflow-hidden"></div>

        {showQuiz && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-8 animate-in zoom-in duration-300">
            <div className="w-full text-center">
              
              {quizStep === 2 && (
                <button onClick={() => playAudio(currentQuestion.word)} className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
                  <span className="text-2xl animate-pulse">🔊</span>
                </button>
              )}

              {quizStep === 1 ? (
                <div className="animate-in fade-in">
                  <h3 className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Phase 01: Awareness</h3>
                  <p className="text-white text-xl font-black mb-10 leading-tight">{currentQuestion.step1.question}</p>
                  <div className="grid gap-3">
                    {currentQuestion.step1.options.map((opt, i) => (
                      <button key={i} onClick={handleStep1} className="py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 text-gray-300 active:scale-95 transition-all">
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom">
                  <h3 className="text-yellow-500 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Phase 02: Mastery</h3>
                  <p className="text-white text-2xl font-black mb-10 leading-tight">{currentQuestion.step2.question}</p>
                  <div className="grid gap-3">
                    {currentQuestion.step2.options.map((opt, i) => (
                      <button key={i} onClick={() => handleStep2(i)} className="py-5 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-sm font-bold hover:bg-blue-600 text-white active:scale-95 transition-all">
                        {opt}
                      </button>
                    ))}
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