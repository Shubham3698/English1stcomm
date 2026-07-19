import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  HelpCircle, 
  Volume2,
  Compass,
  BookOpen,
  MessageSquare,
  Layers,
  Mic,          
  MicOff,       
  Volume1       
} from 'lucide-react';

export default function LessonsPage() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('grammar'); 
  const [expandedChapters, setExpandedChapters] = useState({ ch1: true, rl1: true });
  const [expandedLessons, setExpandedLessons] = useState({});
  
  // Player & Gameplay Modes
  const [activeVideoLesson, setActiveVideoLesson] = useState(null);
  const [activeQuizLesson, setActiveQuizLesson] = useState(null);
  const [activeSpeakingLesson, setActiveSpeakingLesson] = useState(null); 
  
  // Live Quiz Overlay States
  const [showVideoQuiz, setShowVideoQuiz] = useState(false);
  const [videoQuizStep, setVideoQuizStep] = useState(1);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState(new Set());
  const [hasFinishedQuiz, setHasFinishedQuiz] = useState(false);

  // Standalone Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // Voice Practice States
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speakingResult, setSpeakingResult] = useState(null);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null); 
  // 🔥 NAYA REF: Silence detect karne ke liye
  const silenceTimerRef = useRef(null); 

  // --- COMPLETE STRUCTURED COURSE DATA (WITH SPEAKING DATA) ---
  const courseDatabase = {
    grammar: [
      {
        id: "ch1",
        title: "Basic English Grammar",
        subtitle: "Foundation and Core Syntax",
        lessons: [
          {
            id: "l1",
            title: "Noun & Pronoun Basics",
            duration: "10 Mins",
            videoId: "KjiNUjzziQs",
            quizData: {
              triggerTime: 4,
              step1: { question: "Kya aapne 'Parts of Speech' pehle padha hai?", options: ["Nahi, bilkul fresh hu", "Haan, thoda bohot", "Revision kar rha hu"] },
              step2: { question: "Identify the Noun: 'Shubham is coding very fast.'", options: ["Coding", "Shubham", "Fast"], correct: 1 }
            },
            standaloneQuiz: [{ q: "Pronoun kiske jagah par use hota hai?", o: ["Noun", "Verb", "Adjective"], c: 0 }],
            speakingData: { hindi: "Main padhai kar raha hu.", english: "I am studying." }
          }
        ]
      },
      {
        id: "ch2",
        title: "Helping Verbs (Is/Am/Are)",
        subtitle: "Make your sentences correct",
        lessons: [
          {
            id: "l2",
            title: "Use of 'Is'",
            duration: "8 Mins",
            videoId: "KjiNUjzziQs",
            quizData: {
              triggerTime: 5,
              step1: { question: "'Is' singular ke sath aata hai ya plural?", options: ["Singular", "Plural"] },
              step2: { question: "Correct one: 'He ___ going.'", options: ["is", "am", "are"], correct: 0 }
            },
            standaloneQuiz: [{ q: "'He' ke sath kya lagta hai?", o: ["Am", "Is", "Are"], c: 1 }],
            speakingData: { hindi: "Woh ek accha ladka hai.", english: "He is a good boy." }
          }
        ]
      }
    ],
    realLife: [
      {
        id: "rl1",
        title: "At the Medical Shop",
        subtitle: "Buying medicines & asking details",
        lessons: [
          {
            id: "l_rl1",
            title: "Asking for a specific medicine",
            duration: "12 Mins",
            videoId: "KjiNUjzziQs",
            quizData: {
              triggerTime: 6,
              step1: { question: "Chemist se dawa maangne ka sabse polite tarika kya hai?", options: ["Give me this", "Do you have this medicine?", "I want this"] },
              step2: { question: "Translate: 'Mujhe sirdard ki dawa chahiye.'", options: ["I need medicine for headache.", "Give headache pill."], correct: 0 }
            },
            standaloneQuiz: [{ q: "'Prescription' ka matlab kya hota hai?", o: ["Dawa ka bill", "Doctor ka parcha", "Dawa ki expiry date"], c: 1 }],
            speakingData: { hindi: "Mujhe sirdard ki dawa chahiye.", english: "I need medicine for headache." }
          },
          {
            id: "l_rl2",
            title: "Asking about the dosage",
            duration: "9 Mins",
            videoId: "KjiNUjzziQs",
            quizData: {
              triggerTime: 4,
              step1: { question: "Din me do baar dawa khani hai, isko english me kya kahenge?", options: ["Two times eat", "Twice a day"] },
              step2: { question: "Identify correct sentence:", options: ["Take this pill after food.", "Eat this pill behind food."], correct: 0 }
            },
            standaloneQuiz: [{ q: "Empty stomach ka matlab?", o: ["Khali pet", "Khane ke baad"], c: 0 }],
            speakingData: { hindi: "Kya mujhe yeh khali pet khani hai?", english: "Should I take this on an empty stomach?" }
          }
        ]
      }
    ]
  };

  const activeCourseData = courseDatabase[activeTab];
  const totalUnits = activeCourseData.length;
  const totalLectures = activeCourseData.reduce((total, chapter) => total + chapter.lessons.length, 0);

  // --- GLOBAL YOUTUBE CONFIG & HANDLERS ---
  useEffect(() => {
    window.YTConfig = { host: "https://www.youtube.com" };
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    return () => {
      clearInterval(intervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); // Cleanup timer
    };
  }, []);

  useEffect(() => {
    if (activeVideoLesson && window.YT && window.YT.Player) {
      setTimeout(() => {
        playerRef.current = new window.YT.Player('live-video-frame', {
          height: '100%',
          width: '100%',
          videoId: activeVideoLesson.videoId,
          playerVars: { 'controls': 1, 'rel': 0, 'modestbranding': 1, 'playsinline': 1 },
          events: { 'onStateChange': onPlayerStateChange }
        });
      }, 150);
    }
    return () => {
      clearInterval(intervalRef.current);
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
    };
  }, [activeVideoLesson]);

  const onPlayerStateChange = (event) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          const current = Math.floor(playerRef.current.getCurrentTime());
          if (current === activeVideoLesson.quizData.triggerTime && !showVideoQuiz && !triggeredQuizzes.has(current)) {
            playerRef.current.pauseVideo();
            setVideoQuizStep(1); 
            setShowVideoQuiz(true);
            setTriggeredQuizzes(prev => new Set(prev).add(current));
          }
        }
      }, 500);
    } else if (event.data === window.YT.PlayerState.ENDED && !hasFinishedQuiz) {
      clearInterval(intervalRef.current);
      setVideoQuizStep(2);
      setShowVideoQuiz(true);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(activeVideoLesson.quizData.step2.question);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const toggleChapter = (id) => setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleLesson = (id) => setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  const closeLesson = () => setActiveVideoLesson(null);

  const handleVideoQuizStep1 = () => {
    toast.success("Response recorded! Keep watching. 🍿");
    setShowVideoQuiz(false);
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(currentTime + 1.2); 
    playerRef.current.playVideo();
  };

  const handleVideoQuizStep2 = (idx) => {
    if (idx === activeVideoLesson.quizData.step2.correct) {
      toast.success("Awesome! Dynamic Lesson Conquered. 🎉");
      setShowVideoQuiz(false);
      setHasFinishedQuiz(true);
      setActiveVideoLesson(null);
    } else {
      toast.error("Incorrect sequence! Listen carefully.");
    }
  };

  const handleStandaloneQuizAnswer = (idx, correctIdx) => {
    if (idx === correctIdx) {
      toast.success("Right Answer! +10 XP ⚡");
      if (currentQuizIndex + 1 < activeQuizLesson.standaloneQuiz.length) {
        setCurrentQuizIndex(prev => prev + 1);
      } else {
        toast.success("Full Module Cleared! Mastery Updated. 🏆");
        setActiveQuizLesson(null);
        setCurrentQuizIndex(0);
      }
    } else {
      toast.error("Oops! Galat answer, firse socho.");
    }
  };

  // 🔥 VOICE ENGINE FUNCTIONS
  const speakEnglishSentence = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const checkPronunciation = (spoken, target) => {
    const normalize = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
    
    if (normalize(spoken) === normalize(target)) {
      setSpeakingResult('match');
      toast.success("Perfectly spoken! Sentence structured correctly. 🎯");
    } else {
      setSpeakingResult('mismatch');
      toast.error("Not quite right. Correct Answer dekho aur dubara try karo.");
    }
  };

  // 🔥 SUPERCHARGED TOGGLE LISTENING LOGIC FOR MOBILE (FIXED)
  const toggleListening = (targetSentence) => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support Voice Recognition. Try Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US';
    recognition.interimResults = true; 
    recognition.continuous = true; 
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setSpokenText("");
      setSpeakingResult(null);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.onresult = (event) => {
      // Jaise hi user kuch bole, purana silence timer cancel kardo
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
        
      setSpokenText(currentTranscript);

      const normalize = (str) => str.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();

      // 🔥 CONDITION 1: EXACT MATCH (Instant stop & success)
      if (normalize(currentTranscript) === normalize(targetSentence)) {
        checkPronunciation(currentTranscript, targetSentence);
        recognition.stop();
        return;
      }

      // 🔥 CONDITION 2: SILENCE DETECTION (Wait 2 seconds after user stops talking)
      silenceTimerRef.current = setTimeout(() => {
        checkPronunciation(currentTranscript, targetSentence);
        recognition.stop();
      }, 2000); 
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (event.error === 'no-speech') {
        toast.error("Awaaz nahi aayi! Thoda zor se bolo. 🎤");
      } else {
        toast.error(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex justify-center font-sans pb-28 transition-colors duration-500">
      <Toaster position="top-center" toastOptions={{ style: { background: '#8B004A', color: '#F2EFE7', border: '1px solid #E01A76', fontWeight: 'bold' } }} />
      <div className="w-full max-w-md bg-[#F2EFE7] relative px-4">
        
        {/* =========================================
            VIEW A: SEAMLESS CHAIN / TREE PATH VIEW
        ============================================= */}
        {!activeVideoLesson && !activeQuizLesson && !activeSpeakingLesson && (
          <div className="animate-fade-in pt-8 pb-10">
            
            <div className="mb-6 pl-2">
              <span className="text-[#8B004A] text-[10px] uppercase tracking-widest font-black bg-[#8B004A]/10 px-3 py-1.5 rounded-md border border-[#8B004A]/20 shadow-sm">
                Dameeto Academy
              </span>
              <h1 className="text-3xl font-black mt-3 tracking-wide text-[#8B004A] drop-shadow-sm">Your Syllabus</h1>
              
              <div className="flex gap-3 mt-5">
                <div className="flex-1 bg-white border-2 border-gray-100 hover:border-[#8B004A]/30 transition-colors rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="bg-[#8B004A]/10 p-2.5 rounded-xl text-[#8B004A]">
                    <Layers size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-0.5">Units</span>
                    <span className="text-sm font-black text-gray-900">{totalUnits} Modules</span>
                  </div>
                </div>
                
                <div className="flex-1 bg-white border-2 border-gray-100 hover:border-[#FFB800]/30 transition-colors rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="bg-[#FFB800]/20 p-2.5 rounded-xl text-[#FFB800]">
                    <Play size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-0.5">Lectures</span>
                    <span className="text-sm font-black text-gray-900">{totalLectures} Sessions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl mb-8 border border-gray-200 shadow-md ml-2 mr-2 relative z-10">
              <button 
                onClick={() => setActiveTab('grammar')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider ${activeTab === 'grammar' ? 'bg-[#8B004A] text-white shadow-md' : 'text-gray-500 hover:text-[#8B004A] hover:bg-gray-50'}`}
              >
                <BookOpen size={16} strokeWidth={activeTab === 'grammar' ? 2.5 : 2} /> Grammar Book
              </button>
              <button 
                onClick={() => setActiveTab('realLife')}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider ${activeTab === 'realLife' ? 'bg-[#FFB800] text-[#4A0027] shadow-md' : 'text-gray-500 hover:text-[#8B004A] hover:bg-gray-50'}`}
              >
                <MessageSquare size={16} strokeWidth={activeTab === 'realLife' ? 2.5 : 2} /> Real-Life Talk
              </button>
            </div>

            <div className="relative border-l-4 border-gray-200 ml-4 space-y-8 animate-fade-in key={activeTab}">
              
              {activeCourseData.map((chapter) => {
                const isChapterExpanded = !!expandedChapters[chapter.id];
                const dotColor = activeTab === 'grammar' ? 'border-[#8B004A] shadow-[0_0_10px_rgba(139,0,74,0.4)] bg-white' : 'border-[#FFB800] shadow-[0_0_10px_rgba(255,184,0,0.4)] bg-white';
                const textColor = activeTab === 'grammar' ? 'group-hover:text-[#E01A76]' : 'group-hover:text-[#FFB800]';
                const chevronColor = activeTab === 'grammar' ? 'text-[#8B004A]' : 'text-[#FFB800]';

                return (
                  <div key={chapter.id} className="relative pl-6">
                    <div className={`absolute -left-[10px] top-2 h-4 w-4 rounded-full border-[4px] ${dotColor} transition-colors z-10`}></div>
                    
                    <div 
                      onClick={() => toggleChapter(chapter.id)}
                      className="cursor-pointer group flex items-start justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div>
                        <h2 className={`text-lg font-black text-gray-900 tracking-wide transition-colors ${textColor}`}>{chapter.title}</h2>
                        <p className="text-gray-500 text-[10px] uppercase mt-1 font-bold tracking-widest">{chapter.subtitle}</p>
                      </div>
                      <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors">
                        {isChapterExpanded ? <ChevronDown size={14} className={chevronColor} strokeWidth={3} /> : <ChevronRight size={14} className="text-gray-400" strokeWidth={3} />}
                      </div>
                    </div>

                    {isChapterExpanded && (
                      <div className="mt-5 space-y-5 relative animate-fade-in">
                        {chapter.lessons.map((lesson) => {
                          const isLessonExpanded = !!expandedLessons[lesson.id];
                          const hoverBorderVideo = activeTab === 'grammar' ? 'hover:border-[#E01A76]/50' : 'hover:border-[#FFB800]/50';
                          
                          return (
                            <div key={lesson.id} className="relative pl-5">
                              <div className="absolute -left-[22px] top-0 bottom-0 w-6 border-l-4 border-b-4 border-gray-200 rounded-bl-xl h-4 z-0"></div>
                              <div className="absolute -left-[4px] top-2.5 h-2.5 w-2.5 rounded-full bg-gray-400 border-[2px] border-[#F2EFE7] z-10"></div>

                              <div 
                                onClick={() => toggleLesson(lesson.id)}
                                className="flex items-center justify-between cursor-pointer group bg-white/60 hover:bg-white p-3.5 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all shadow-sm"
                              >
                                <div>
                                  <h3 className={`text-sm font-black text-gray-700 transition-colors ${activeTab === 'grammar' ? 'group-hover:text-[#8B004A]' : 'group-hover:text-gray-900'}`}>
                                    {lesson.title}
                                  </h3>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1 tracking-wider">{lesson.duration}</span>
                                </div>
                                {isLessonExpanded ? <ChevronDown size={14} className="text-gray-400" strokeWidth={2.5} /> : <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" strokeWidth={2.5} />}
                              </div>

                              {isLessonExpanded && (
                                <div className="mt-3 pl-3 space-y-2.5 relative border-l-2 border-dashed border-gray-300 ml-1">
                                  
                                  {/* Button 1: Video */}
                                  <button 
                                    onClick={() => setActiveVideoLesson(lesson)}
                                    className={`w-full relative flex items-center justify-between bg-white hover:bg-gray-50 border-2 border-gray-100 ${hoverBorderVideo} p-3.5 rounded-xl transition-all shadow-sm group active:scale-95`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${activeTab === 'grammar' ? 'bg-[#8B004A] text-white' : 'bg-[#FFB800] text-[#4A0027]'}`}>
                                        <Play size={14} className="fill-current" />
                                      </div>
                                      <span className={`text-xs font-black uppercase tracking-wider ${activeTab === 'grammar' ? 'text-gray-600 group-hover:text-[#8B004A]' : 'text-gray-600 group-hover:text-gray-900'}`}>Watch Session</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-gray-400 ${activeTab === 'grammar' ? 'group-hover:text-[#8B004A]' : 'group-hover:text-gray-900'}`} strokeWidth={3} />
                                  </button>

                                  {/* Button 2: Quick Test */}
                                  <button 
                                    onClick={() => {
                                      setActiveQuizLesson(lesson);
                                      setCurrentQuizIndex(0);
                                    }}
                                    className="w-full relative flex items-center justify-between bg-white hover:bg-[#E01A76]/5 border-2 border-gray-100 hover:border-[#E01A76]/40 p-3.5 rounded-xl transition-all shadow-sm group active:scale-95"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-[#E01A76]/10 flex items-center justify-center text-[#E01A76] border border-[#E01A76]/20 shadow-sm">
                                        <HelpCircle size={14} strokeWidth={2.5} />
                                      </div>
                                      <span className="text-xs font-black uppercase tracking-wider text-gray-600 group-hover:text-[#E01A76]">Quick Test</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-400 group-hover:text-[#E01A76]" strokeWidth={3} />
                                  </button>

                                  {/* Button 3: Real Talk Voice Practice */}
                                  {lesson.speakingData && (
                                    <button 
                                      onClick={() => {
                                        setActiveSpeakingLesson(lesson);
                                        setSpokenText("");
                                        setSpeakingResult(null);
                                      }}
                                      className="w-full relative flex items-center justify-between bg-white hover:bg-[#10B981]/5 border-2 border-gray-100 hover:border-[#10B981]/40 p-3.5 rounded-xl transition-all shadow-sm group active:scale-95"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20 shadow-sm">
                                          <Mic size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-wider text-gray-600 group-hover:text-[#10B981]">Speak & Check</span>
                                      </div>
                                      <ChevronRight size={14} className="text-gray-400 group-hover:text-[#10B981]" strokeWidth={3} />
                                    </button>
                                  )}

                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================
            VIEW B: VIDEO THEATER MODE
        ============================================= */}
        {activeVideoLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-white border-b-2 border-gray-200 shadow-sm">
              <button onClick={closeLesson} className="p-2.5 bg-gray-100 text-gray-500 hover:text-[#8B004A] hover:bg-gray-200 rounded-xl transition-all border border-gray-200 active:scale-90">
                <ChevronDown className="rotate-90" size={18} strokeWidth={2.5} />
              </button>
              <div className="text-center flex-1 px-4">
                <span className={`text-[9px] font-black uppercase tracking-widest block ${activeTab === 'grammar' ? 'text-[#8B004A]' : 'text-[#FFB800]'}`}>Theater Engine</span>
                <h2 className="text-sm font-black text-gray-800 truncate mt-0.5">{activeVideoLesson.title}</h2>
              </div>
              <div className="w-10"></div>
            </div>

            <div className="w-full aspect-video bg-black relative shadow-xl">
              <div id="live-video-frame" className="absolute inset-0 w-full h-full"></div>
            </div>

            <div className="flex-1 p-6 bg-[#F2EFE7] overflow-y-auto">
              <h3 className="text-lg font-black text-[#8B004A] mb-2 uppercase tracking-wide">Syllabus Insights</h3>
              <p className="text-sm text-gray-600 font-medium leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                Video sync tracker is running. Interactive check-points will analyze user focus streams to maximize retention.
              </p>
              
              <div className="mt-5 bg-white border-2 border-[#8B004A]/10 rounded-xl p-4.5 flex items-center gap-4 shadow-sm">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${activeTab === 'grammar' ? 'bg-[#8B004A]/10 text-[#8B004A]' : 'bg-[#FFB800]/20 text-[#FFB800]'}`}>
                  <Compass size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Target Trigger Node</span>
                  <p className="text-sm font-black text-gray-800">Halts automations at <span className="text-[#E01A76]">{activeVideoLesson.quizData.triggerTime}s</span></p>
                </div>
              </div>
            </div>

            {showVideoQuiz && (
              <div className="absolute inset-0 z-[100] bg-[#4A0027]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-full bg-white border-[4px] border-white/50 rounded-[2rem] p-6 shadow-2xl relative text-center">
                  
                  {videoQuizStep === 2 && (
                    <button 
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(activeVideoLesson.quizData.step2.question);
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className={`w-16 h-16 bg-[#F2EFE7] hover:bg-gray-200 border-2 border-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm active:scale-90 transition-transform ${activeTab === 'grammar' ? 'text-[#8B004A]' : 'text-[#FFB800]'}`}
                    >
                      <Volume2 size={24} strokeWidth={2.5} />
                    </button>
                  )}

                  <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ${activeTab === 'grammar' ? 'text-[#8B004A]' : 'text-[#FFB800]'}`}>
                    {videoQuizStep === 1 ? 'Checkpoint Awareness' : 'Syllabus Verdict'}
                  </span>
                  <p className="text-gray-900 font-black text-xl mb-8 leading-snug drop-shadow-sm">
                    {videoQuizStep === 1 ? activeVideoLesson.quizData.step1.question : activeVideoLesson.quizData.step2.question}
                  </p>

                  <div className="grid gap-3">
                    {(videoQuizStep === 1 ? activeVideoLesson.quizData.step1.options : activeVideoLesson.quizData.step2.options).map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => videoQuizStep === 1 ? handleVideoQuizStep1() : handleVideoQuizStep2(idx)}
                        className={`w-full bg-gray-50 hover:bg-[#8B004A] text-gray-700 hover:text-white py-4 px-5 rounded-2xl text-sm font-black transition-all border-2 border-gray-200 hover:border-[#8B004A] flex justify-between items-center group active:scale-[0.98] shadow-sm`}
                      >
                        <span>{opt}</span>
                        <ChevronRight size={16} className={`text-gray-400 transition-colors group-hover:text-white`} strokeWidth={3} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================
            VIEW C: STANDALONE QUIZ MODE
        ============================================= */}
        {activeQuizLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in p-4">
            <div className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-6 shadow-sm mt-4">
              <button 
                onClick={() => { setActiveQuizLesson(null); setCurrentQuizIndex(0); }}
                className="text-[10px] font-black uppercase tracking-wider bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                ✕ Exit
              </button>
              <div className="text-center">
                <span className="text-[9px] font-black text-[#E01A76] uppercase tracking-widest block">Standalone Module</span>
                <p className="text-sm font-black text-gray-800 truncate mt-0.5 max-w-[140px]">{activeQuizLesson.title}</p>
              </div>
              <span className="text-[11px] font-black bg-[#E01A76] text-white px-3 py-1.5 rounded-lg shadow-sm">
                Q: {currentQuizIndex + 1} / {activeQuizLesson.standaloneQuiz.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E01A76]"></div>
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Analyze Syntax Structure</span>
                
                <p className="text-xl md:text-2xl font-black text-[#8B004A] leading-normal px-2 drop-shadow-sm">
                  "{activeQuizLesson.standaloneQuiz[currentQuizIndex].q}"
                </p>

                <div className="grid gap-3 pt-6 w-full">
                  {activeQuizLesson.standaloneQuiz[currentQuizIndex].o.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStandaloneQuizAnswer(idx, activeQuizLesson.standaloneQuiz[currentQuizIndex].c)}
                      className="w-full bg-gray-50 hover:bg-[#8B004A] text-gray-700 hover:text-white border-2 border-gray-200 hover:border-[#8B004A] py-4.5 px-6 rounded-2xl text-sm font-black transition-all transform active:scale-[0.98] text-left flex justify-between items-center group shadow-sm"
                    >
                      <span>{option}</span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={3} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            🔥 VIEW D: REAL-LIFE SPEAKING PRACTICE 
        ============================================= */}
        {activeSpeakingLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in p-4">
            <div className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-6 shadow-sm mt-4">
              <button 
                onClick={() => { 
                  setActiveSpeakingLesson(null); 
                  setIsListening(false); 
                  if(recognitionRef.current) recognitionRef.current.stop(); 
                  if(silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                }}
                className="text-[10px] font-black uppercase tracking-wider bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                ✕ Exit
              </button>
              <div className="text-center flex-1">
                <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest block">Voice Engine</span>
                <p className="text-sm font-black text-gray-800 truncate mt-0.5">{activeSpeakingLesson.title}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              
              {/* Hindi Sentence Display */}
              <div className="bg-white border-2 border-[#10B981]/20 rounded-3xl p-6 shadow-lg text-center w-full max-w-[90%] relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white text-[9px] uppercase font-black px-4 py-1 rounded-full shadow-md tracking-widest">
                  Translate this
                </div>
                
                <p className="text-2xl font-black text-gray-800 mt-4 mb-4 leading-relaxed">
                  "{activeSpeakingLesson.speakingData.hindi}"
                </p>

                <button 
                  onClick={() => speakEnglishSentence(activeSpeakingLesson.speakingData.english)}
                  className="mx-auto flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-[#10B981] bg-gray-50 hover:bg-[#10B981]/10 px-4 py-2 rounded-full transition-all border border-gray-200"
                >
                  <Volume1 size={14} /> Answer sunne ke liye tap karein
                </button>
              </div>

              {/* Status & Spoken Text Area (LIVE TYPING ENABLED) */}
              <div className="mt-8 min-h-[100px] w-full text-center px-4">
                {spokenText ? (
                  <div className={`p-4 rounded-xl border-2 ${speakingResult === 'match' ? 'bg-[#10B981]/10 border-[#10B981]/50 text-[#10B981]' : speakingResult === 'mismatch' ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                    <span className="text-[10px] uppercase font-black tracking-wider block mb-1">Aapne kaha:</span>
                    <p className="text-lg font-bold">{spokenText}</p>
                    
                    {speakingResult === 'mismatch' && (
                      <div className="mt-4 pt-3 border-t border-red-200/50">
                        <span className="text-[10px] uppercase font-black tracking-wider text-gray-400 block mb-1">Correct Answer:</span>
                        <p className="text-sm font-bold text-gray-600">{activeSpeakingLesson.speakingData.english}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider animate-pulse flex flex-col items-center gap-2">
                    {isListening ? "Listening..." : "Tap mic and start speaking in English"}
                    {isListening && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                  </p>
                )}
              </div>

              {/* Big Mic Button - FIXED FOR MOBILE REDIRECT */}
              <div className="mt-10 mb-8">
                <button
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    toggleListening(activeSpeakingLesson.speakingData.english);
                  }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isListening ? 'bg-[#10B981] text-white scale-110 shadow-[#10B981]/40 animate-pulse' : 'bg-white text-gray-400 border-[4px] border-gray-100 hover:border-[#10B981]/50 hover:text-[#10B981] active:scale-95'}`}
                >
                  {isListening ? <MicOff size={36} strokeWidth={2.5} /> : <Mic size={36} strokeWidth={2.5} />}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}