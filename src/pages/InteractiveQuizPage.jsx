import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import { 
  Brain, 
  Zap, 
  Target, 
  Volume2, 
  CheckCircle2, 
  PlayCircle, 
  ArrowRight,
  Sparkles,
  Mic,
  ShieldCheck
} from "lucide-react";

// ==========================================
// 📱 COMPONENT 1: THE INTERACTIVE DEMO (Your Code)
// ==========================================
const InteractivePhoneDemo = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(1); 
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState(new Set());
  const [hasFinishedQuiz, setHasFinishedQuiz] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const wordData = { 
    word: "Withered",
    step1: {
      title: "Quick Sync 🧠",
      question: "Kya aapne 'Withered' word pehle kabhi suna hai?",
      options: ["Ekdam naya hai", "Haan, suna-suna lagta hai", "Daily life wala word hai"],
    },
    step2: {
      title: "Mastery Check 🎯",
      question: "Final Test: 'Withered' ka sahi matlab kya hai?",
      options: ["Murjhaya hua / Sookha hua", "Bahut gussa", "Tezi se bhagna"],
      correct: 0
    }
  };

  const playAudio = (word) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // Only load if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('demo-player', {
        height: '100%',
        width: '100%',
        videoId: 'KjiNUjzziQs',
        playerVars: { 'controls': 1, 'rel': 0, 'modestbranding': 1, 'playsinline': 1 },
        events: { 'onStateChange': onPlayerStateChange }
      });
    };
    return () => clearInterval(intervalRef.current);
  }, []);

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsFocusMode(true);
      startTracking();
    } else if (event.data === window.YT.PlayerState.ENDED && !hasFinishedQuiz) {
      clearInterval(intervalRef.current);
      setIsFocusMode(false);
      triggerFinalQuiz();
    } else {
      clearInterval(intervalRef.current);
      setIsFocusMode(false);
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
    setTimeout(() => playAudio(wordData.word), 500);
  };

  const handleStep1 = () => {
    toast.success("Awesome! Let's continue watching.", { icon: '🔥', id: 'step1' });
    setShowQuiz(false);
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime + 1.2); 
    playerRef.current.playVideo();
  };

  const handleStep2 = (idx) => {
    if (idx === currentQuestion.step2.correct) {
      toast.success("Perfect! Vocabulary Mastered. ✨", { style: { background: '#10B981', color: '#fff' }, id: 'step2' });
      setShowQuiz(false);
      setHasFinishedQuiz(true); 
    } else {
      toast.error("Oops! Suno aur wapas try karo.", { id: 'err' });
      playAudio(currentQuestion.word);
    }
  };

  return (
    <div className="relative w-full max-w-[360px] mx-auto aspect-[9/19] bg-[#0a0a0c] rounded-[3.5rem] p-3 border-[6px] border-[#1a1a1f] shadow-2xl overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.15)] transition-transform duration-700 hover:-translate-y-2">
      
      {/* Decorative Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a1f] rounded-b-2xl z-40 flex items-center justify-center">
        <div className="w-12 h-1.5 bg-gray-800 rounded-full"></div>
      </div>

      {/* Floating Focus Badge */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 z-40 bg-black/70 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 transition-all duration-500 ${isFocusMode && !showQuiz ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Focus Mode</span>
      </div>

      {/* Video Player */}
      <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-black relative z-10">
        <div id="demo-player" className="absolute inset-0 w-full h-full pointer-events-auto"></div>
      </div>

      {/* Interactive Quiz Overlay */}
      <div className={`absolute inset-0 z-50 flex flex-col justify-end transition-all duration-500 ease-out ${showQuiz ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        <div className={`relative w-full bg-[#0f0f13]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[2.5rem] p-6 pb-10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] transition-transform duration-500 delay-100 ${showQuiz ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>

          {currentQuestion && (
            <div className="w-full text-center">
              
              {quizStep === 2 && (
                <button onClick={() => playAudio(currentQuestion.word)} className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-90 transition-transform">
                  <Volume2 className="text-white" size={28} />
                </button>
              )}

              {quizStep === 1 ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 mb-3 text-blue-400">
                    <Brain size={16} />
                    <h3 className="font-black uppercase text-[10px] tracking-[0.3em]">{currentQuestion.step1.title}</h3>
                  </div>
                  <p className="text-white text-lg font-bold mb-8 leading-snug px-2">{currentQuestion.step1.question}</p>
                  <div className="grid gap-3">
                    {currentQuestion.step1.options.map((opt, i) => (
                      <button key={i} onClick={handleStep1} className="group relative overflow-hidden py-3.5 px-5 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-gray-300 hover:text-white active:scale-[0.98] transition-all flex justify-between items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="relative z-10">{opt}</span>
                        <Zap size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-center gap-2 mb-3 text-amber-400">
                    <Target size={16} />
                    <h3 className="font-black uppercase text-[10px] tracking-[0.3em]">{currentQuestion.step2.title}</h3>
                  </div>
                  <p className="text-white text-[20px] font-black mb-8 leading-snug px-2">{currentQuestion.step2.question}</p>
                  <div className="grid gap-3">
                    {currentQuestion.step2.options.map((opt, i) => (
                      <button key={i} onClick={() => handleStep2(i)} className="relative py-3.5 px-5 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 rounded-2xl text-sm font-bold text-blue-100 hover:text-white active:scale-[0.98] transition-all flex justify-between items-center group">
                        <span>{opt}</span>
                        <CheckCircle2 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 COMPONENT 2: THE MAIN LANDING PAGE
// ==========================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden relative selection:bg-blue-500/30">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1a1a1f', color: '#fff', border: '1px solid #333' } }} />

      {/* Futuristic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={20} className="text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-black tracking-wide">Dameeto<span className="text-blue-500">Tech</span></span>
        </div>
        <button className="hidden md:flex items-center gap-2 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-full transition-all">
          Get Developer API <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero Section Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
        
        {/* Left Column: Marketing Copy */}
        <div className="flex flex-col items-start text-left">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-black tracking-widest mb-8">
            <Sparkles size={14} />
            Introducing ActiveFocus™ Engine
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
            Passive Learning is <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600">
              Officially Dead.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl font-medium leading-relaxed">
            Sirf video dekhne se kuch yaad nahi rehta. Hamari AI-driven technology video ke beech mein aapko interrupt karti hai, dhyan focus karwati hai, aur live tests leti hai.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-14">
            <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] active:scale-95">
              <PlayCircle size={20} /> Try Demo Video
            </button>
            <button className="flex items-center gap-3 bg-transparent hover:bg-white/5 border-2 border-white/10 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider text-white transition-all active:scale-95">
              See How It Works
            </button>
          </div>

          {/* Feature Highlight Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 mt-0.5">
                <Target size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-100">Dynamic Checkpoints</h4>
                <p className="text-xs text-gray-500 mt-1">Stops video to test attention.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400 mt-0.5">
                <Mic size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-100">Voice Recognition</h4>
                <p className="text-xs text-gray-500 mt-1">Checks pronunciation live.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl sm:col-span-2">
              <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 mt-0.5">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-100">Anti-Distraction Engine</h4>
                <p className="text-xs text-gray-500 mt-1">Forces focus mode to guarantee 10x better retention than normal YouTube videos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Phone Demo */}
        <div className="relative w-full flex justify-center lg:justify-end items-center mt-10 lg:mt-0">
          
          {/* Subtle glowing ring behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border border-purple-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
          
          {/* Pointer Hint */}
          <div className="absolute -left-12 top-1/4 hidden lg:flex flex-col items-end gap-2 animate-pulse">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Click Play To Test</span>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 transform rotate-12">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>

          <InteractivePhoneDemo />
        </div>

      </main>
    </div>
  );
}