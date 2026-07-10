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
  MessageSquare
} from 'lucide-react';

export default function LessonsPage() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('grammar'); // 'grammar' or 'realLife'
  const [expandedChapters, setExpandedChapters] = useState({ ch1: true, rl1: true });
  const [expandedLessons, setExpandedLessons] = useState({});
  
  // Player & Gameplay Modes
  const [activeVideoLesson, setActiveVideoLesson] = useState(null);
  const [activeQuizLesson, setActiveQuizLesson] = useState(null);
  
  // Live Quiz Overlay States
  const [showVideoQuiz, setShowVideoQuiz] = useState(false);
  const [videoQuizStep, setVideoQuizStep] = useState(1);
  const [triggeredQuizzes, setTriggeredQuizzes] = useState(new Set());
  const [hasFinishedQuiz, setHasFinishedQuiz] = useState(false);

  // Standalone Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // --- COMPLETE STRUCTURED COURSE DATA (2 BOOKS) ---
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
              step1: {
                question: "Kya aapne 'Parts of Speech' pehle padha hai?",
                options: ["Nahi, bilkul fresh hu", "Haan, thoda bohot", "Revision kar rha hu"]
              },
              step2: {
                question: "Identify the Noun: 'Shubham is coding very fast.'",
                options: ["Coding", "Shubham", "Fast"],
                correct: 1
              }
            },
            standaloneQuiz: [
              { q: "Pronoun kiske jagah par use hota hai?", o: ["Noun", "Verb", "Adjective"], c: 0 }
            ]
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
            standaloneQuiz: [
              { q: "'He' ke sath kya lagta hai?", o: ["Am", "Is", "Are"], c: 1 }
            ]
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
            standaloneQuiz: [
              { q: "'Prescription' ka matlab kya hota hai?", o: ["Dawa ka bill", "Doctor ka parcha", "Dawa ki expiry date"], c: 1 }
            ]
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
            standaloneQuiz: [
              { q: "Empty stomach ka matlab?", o: ["Khali pet", "Khane ke baad"], c: 0 }
            ]
          }
        ]
      },
      {
        id: "rl2",
        title: "At the Hospital",
        subtitle: "Talking to the Reception & Doctor",
        lessons: [
          {
            id: "l_rl3",
            title: "Booking an Appointment",
            duration: "15 Mins",
            videoId: "KjiNUjzziQs",
            quizData: {
              triggerTime: 5,
              step1: { question: "Receptionist se doctor se milne ke liye kya puchenge?", options: ["I want to meet doctor.", "I'd like to book an appointment."] },
              step2: { question: "What is 'OPD'?", options: ["Outpatient Department", "Operation Department"], correct: 0 }
            },
            standaloneQuiz: [
              { q: "'Consultation fee' kise kehte hain?", o: ["Dawa ka kharcha", "Doctor ki fees"], c: 1 }
            ]
          }
        ]
      }
    ]
  };

  // Switch between the two tracks based on state
  const activeCourseData = courseDatabase[activeTab];

  // --- GLOBAL YOUTUBE CONFIG & HANDLERS ---
  useEffect(() => {
    window.YTConfig = { host: "https://www.youtube.com" };
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    return () => clearInterval(intervalRef.current);
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

  // --- ACTIONS ---
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

  return (
    <div className="min-h-screen bg-[#0b101a] text-white flex justify-center font-sans pb-28">
      <Toaster position="top-center" toastOptions={{ style: { background: '#121c2d', color: '#fff', border: '1px solid #1e293b' } }} />
      <div className="w-full max-w-md bg-[#0b101a] relative px-4">
        
        {/* =========================================
            VIEW A: SEAMLESS CHAIN / TREE PATH VIEW
        ============================================= */}
        {!activeVideoLesson && !activeQuizLesson && (
          <div className="animate-fade-in pt-8 pb-10">
            
            {/* Page Header */}
            <div className="mb-6 pl-2">
              <span className="text-[#41ffd1] text-[10px] uppercase tracking-widest font-black bg-[#41ffd1]/10 px-2.5 py-1 rounded border border-[#41ffd1]/30">
                Dameeto Academy
              </span>
              <h1 className="text-3xl font-black mt-3 tracking-tight">Your Syllabus</h1>
            </div>

            {/* TAB SWITCHER (2 Books) */}
            <div className="flex bg-[#121c2d] p-1 rounded-2xl mb-8 border border-[#1e293b] shadow-sm ml-2 mr-2 relative z-10">
              <button 
                onClick={() => setActiveTab('grammar')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'grammar' ? 'bg-[#41ffd1] text-[#0b101a] shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                <BookOpen size={14} /> Grammar Book
              </button>
              <button 
                onClick={() => setActiveTab('realLife')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'realLife' ? 'bg-yellow-500 text-[#0b101a] shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
              >
                <MessageSquare size={14} /> Real-Life Talk
              </button>
            </div>

            {/* The Continuous Chain Container */}
            <div className="relative border-l-2 border-[#1e293b] ml-4 space-y-8 animate-fade-in key={activeTab}">
              
              {activeCourseData.map((chapter) => {
                const isChapterExpanded = !!expandedChapters[chapter.id];
                // Different dot color based on active tab for visual feedback
                const dotColor = activeTab === 'grammar' ? 'border-[#41ffd1] shadow-[0_0_10px_rgba(65,255,209,0.4)]' : 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
                const textColor = activeTab === 'grammar' ? 'group-hover:text-[#41ffd1]' : 'group-hover:text-yellow-500';
                const chevronColor = activeTab === 'grammar' ? 'text-[#41ffd1]' : 'text-yellow-500';

                return (
                  <div key={chapter.id} className="relative pl-6">
                    {/* Chapter Node Dot */}
                    <div className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-[#0b101a] border-4 ${dotColor} transition-colors`}></div>
                    
                    {/* Chapter Header (Trigger) */}
                    <div 
                      onClick={() => toggleChapter(chapter.id)}
                      className="cursor-pointer group flex items-start justify-between"
                    >
                      <div>
                        <h2 className={`text-lg font-bold text-white tracking-wide transition-colors ${textColor}`}>{chapter.title}</h2>
                        <p className="text-gray-500 text-[10px] uppercase mt-0.5 font-bold tracking-wider">{chapter.subtitle}</p>
                      </div>
                      <div className="mt-1 bg-[#121c2d] p-1.5 rounded-full border border-gray-800">
                        {isChapterExpanded ? <ChevronDown size={14} className={chevronColor} /> : <ChevronRight size={14} className="text-gray-500" />}
                      </div>
                    </div>

                    {/* Lessons inside Chapter (Nested Tree Branch) */}
                    {isChapterExpanded && (
                      <div className="mt-5 space-y-5 relative animate-fade-in">
                        {chapter.lessons.map((lesson) => {
                          const isLessonExpanded = !!expandedLessons[lesson.id];
                          const hoverBorderVideo = activeTab === 'grammar' ? 'hover:border-[#41ffd1]/40' : 'hover:border-yellow-500/40';
                          
                          return (
                            <div key={lesson.id} className="relative pl-5">
                              {/* Curved connection line */}
                              <div className="absolute -left-6 top-0 bottom-0 w-5 border-l-2 border-b-2 border-[#1e293b] rounded-bl-xl h-4"></div>
                              
                              {/* Lesson Node Dot */}
                              <div className="absolute -left-[3px] top-2 h-2.5 w-2.5 rounded-full bg-gray-600 border-2 border-[#0b101a]"></div>

                              {/* Lesson Header */}
                              <div 
                                onClick={() => toggleLesson(lesson.id)}
                                className="flex items-center justify-between cursor-pointer group bg-[#121c2d]/40 p-3 rounded-xl border border-transparent hover:border-[#1e293b] transition-all"
                              >
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                                    {lesson.title}
                                  </h3>
                                  <span className="text-[9px] text-gray-500 font-bold uppercase block mt-1">{lesson.duration}</span>
                                </div>
                                {isLessonExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-600" />}
                              </div>

                              {/* Action Nodes */}
                              {isLessonExpanded && (
                                <div className="mt-3 pl-3 space-y-2 relative border-l-2 border-dashed border-gray-800 ml-1">
                                  <button 
                                    onClick={() => setActiveVideoLesson(lesson)}
                                    className={`w-full relative flex items-center justify-between bg-[#121c2d] hover:bg-[#1a2538] border border-[#1e293b] ${hoverBorderVideo} p-3 rounded-xl transition-all shadow-sm group`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeTab === 'grammar' ? 'bg-[#41ffd1]/10 text-[#41ffd1]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        <Play size={12} className="fill-current" />
                                      </div>
                                      <span className="text-xs font-bold text-gray-300 group-hover:text-white">Watch Session</span>
                                    </div>
                                    <ChevronRight size={14} className={`text-gray-600 ${activeTab === 'grammar' ? 'group-hover:text-[#41ffd1]' : 'group-hover:text-yellow-500'}`} />
                                  </button>

                                  <button 
                                    onClick={() => {
                                      setActiveQuizLesson(lesson);
                                      setCurrentQuizIndex(0);
                                    }}
                                    className="w-full relative flex items-center justify-between bg-[#121c2d] hover:bg-[#1a2538] border border-[#1e293b] hover:border-purple-500/40 p-3 rounded-xl transition-all shadow-sm group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <HelpCircle size={14} />
                                      </div>
                                      <span className="text-xs font-bold text-gray-300 group-hover:text-white">Quick Test</span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-500" />
                                  </button>
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

        {/* ... (VIEW B and VIEW C remain identical to previous code, just pasting exact logic here for completeness) ... */}

        {activeVideoLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#0b101a] w-full max-w-md mx-auto h-screen animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-[#121c2d] border-b border-gray-800 shadow-md">
              <button onClick={closeLesson} className="p-2 bg-[#1a2538] text-gray-400 hover:text-white rounded-xl transition-colors border border-gray-700">
                <ChevronDown className="rotate-90" size={18} />
              </button>
              <div className="text-center flex-1 px-4">
                <span className={`text-[8px] font-bold uppercase tracking-widest block ${activeTab === 'grammar' ? 'text-[#41ffd1]' : 'text-yellow-500'}`}>Theater Engine</span>
                <h2 className="text-xs font-bold text-white truncate mt-0.5">{activeVideoLesson.title}</h2>
              </div>
              <div className="w-9"></div>
            </div>

            <div className="w-full aspect-video bg-black relative shadow-xl">
              <div id="live-video-frame" className="absolute inset-0 w-full h-full"></div>
            </div>

            <div className="flex-1 p-5 bg-[#0b101a] overflow-y-auto">
              <h3 className="text-base font-bold text-white mb-2">Syllabus Insights</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Video sync tracker is running. Interactive check-points will analyze user focus streams.
              </p>
              
              <div className="mt-5 bg-[#121c2d] border border-blue-900/30 rounded-xl p-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'grammar' ? 'bg-[#41ffd1]/10 text-[#41ffd1]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                  <Compass size={16} />
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">Target Trigger Node</span>
                  <p className="text-sm font-bold text-white">Halts automations at {activeVideoLesson.quizData.triggerTime}s</p>
                </div>
              </div>
            </div>

            {showVideoQuiz && (
              <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-full bg-[#121c2d] border border-blue-900/40 rounded-3xl p-5 shadow-2xl relative text-center">
                  
                  {videoQuizStep === 2 && (
                    <button 
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const u = new SpeechSynthesisUtterance(activeVideoLesson.quizData.step2.question);
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className={`w-14 h-14 bg-[#1a2538] hover:bg-gray-700 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md active:scale-90 transition-transform ${activeTab === 'grammar' ? 'text-[#41ffd1]' : 'text-yellow-500'}`}
                    >
                      <Volume2 size={20} />
                    </button>
                  )}

                  <span className={`text-[9px] uppercase font-bold tracking-[0.2em] mb-2 block ${activeTab === 'grammar' ? 'text-[#41ffd1]' : 'text-yellow-500'}`}>
                    {videoQuizStep === 1 ? 'Checkpoint Awareness' : 'Syllabus Verdict'}
                  </span>
                  <p className="text-white font-bold text-lg mb-6 leading-snug">
                    {videoQuizStep === 1 ? activeVideoLesson.quizData.step1.question : activeVideoLesson.quizData.step2.question}
                  </p>

                  <div className="grid gap-2.5">
                    {(videoQuizStep === 1 ? activeVideoLesson.quizData.step1.options : activeVideoLesson.quizData.step2.options).map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => videoQuizStep === 1 ? handleVideoQuizStep1() : handleVideoQuizStep2(idx)}
                        className={`w-full bg-[#1a2538] hover:bg-gray-800 text-gray-200 py-3.5 px-4 rounded-xl text-xs font-bold transition-all border border-gray-700 flex justify-between items-center group active:scale-95`}
                      >
                        <span>{opt}</span>
                        <ChevronRight size={14} className={`text-gray-600 transition-colors ${activeTab === 'grammar' ? 'group-hover:text-[#41ffd1]' : 'group-hover:text-yellow-500'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeQuizLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#0b101a] w-full max-w-md mx-auto h-screen animate-fade-in p-4">
            <div className="flex justify-between items-center bg-[#121c2d] border border-blue-900/30 rounded-2xl p-4 mb-6 shadow-md mt-4">
              <button 
                onClick={() => { setActiveQuizLesson(null); setCurrentQuizIndex(0); }}
                className="text-[10px] font-bold uppercase tracking-wider bg-[#1a2538] px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white"
              >
                ✕ Exit
              </button>
              <div className="text-center">
                <span className="text-[8px] font-bold text-purple-500 uppercase tracking-widest block">Standalone Module</span>
                <p className="text-xs font-bold text-white truncate mt-0.5 max-w-[120px]">{activeQuizLesson.title}</p>
              </div>
              <span className="text-[10px] font-bold bg-purple-500 text-black px-2.5 py-1 rounded-md shadow-sm">
                Q: {currentQuizIndex + 1} / {activeQuizLesson.standaloneQuiz.length}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="bg-[#121c2d] border border-gray-800 rounded-3xl p-6 text-center shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Analyze Syntax Structure</span>
                
                <p className="text-lg md:text-xl font-bold text-white leading-normal px-2">
                  "{activeQuizLesson.standaloneQuiz[currentQuizIndex].q}"
                </p>

                <div className="grid gap-3 pt-4 w-full">
                  {activeQuizLesson.standaloneQuiz[currentQuizIndex].o.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStandaloneQuizAnswer(idx, activeQuizLesson.standaloneQuiz[currentQuizIndex].c)}
                      className="w-full bg-[#1a2538] hover:bg-gray-800 text-gray-200 border border-gray-700 py-4 px-5 rounded-2xl text-xs font-bold transition-all transform active:scale-95 text-left flex justify-between items-center group"
                    >
                      <span>{option}</span>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-purple-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}