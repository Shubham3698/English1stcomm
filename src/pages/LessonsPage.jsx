import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
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
  const [activeTab, setActiveTab] = useState('grammar'); 
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  
  const [courseDatabase, setCourseDatabase] = useState({ grammar: [], realLife: [] });
  const [isLoading, setIsLoading] = useState(true);

  const [activeVideoLesson, setActiveVideoLesson] = useState(null);
  const [activeQuizLesson, setActiveQuizLesson] = useState(null);
  const [activeSpeakingLesson, setActiveSpeakingLesson] = useState(null); 
  
  const [showVideoQuiz, setShowVideoQuiz] = useState(false);
  const [activePopupQuiz, setActivePopupQuiz] = useState(null); 
  const [triggeredQuizzes, setTriggeredQuizzes] = useState(new Set());

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [speakingResult, setSpeakingResult] = useState(null);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null); 

  // 🔥 YAHAN URL FIX HAI: App me humesha Live Server chalega!
  const isApp = Capacitor.isNativePlatform();
  const API_BASE_URL = isApp 
    ? "https://serdeptry1st.onrender.com" 
    : (window.location.hostname === "localhost" ? "http://localhost:3000" : "https://serdeptry1st.onrender.com");

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/syllabus`);
        const data = await response.json();
        setCourseDatabase(data);
        setIsLoading(false);
        if (data.grammar && data.grammar.length > 0) {
          setExpandedChapters({ [data.grammar[0]._id || data.grammar[0].id]: true });
        }
      } catch (error) {
        console.error("Error fetching syllabus:", error);
        toast.error("Failed to load latest syllabus.");
        setIsLoading(false);
      }
    };
    fetchSyllabus();
  }, [API_BASE_URL]);

  const activeCourseData = courseDatabase[activeTab] || [];
  const totalUnits = activeCourseData.length;
  const totalLectures = activeCourseData.reduce((total, chapter) => total + (chapter.lessons ? chapter.lessons.length : 0), 0);

  const getYouTubeID = (url) => {
    if (!url) return "";
    if (url.length === 11 && !url.includes('http')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

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
      const safeVideoId = getYouTubeID(activeVideoLesson.videoId);
      
      setTimeout(() => {
        playerRef.current = new window.YT.Player('live-video-frame', {
          height: '100%',
          width: '100%',
          videoId: safeVideoId,
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
        if (playerRef.current?.getCurrentTime && activeVideoLesson.videoQuizzes) {
          const current = Math.floor(playerRef.current.getCurrentTime());
          
          const matchingQuiz = activeVideoLesson.videoQuizzes.find(q => q.time === current);

          if (matchingQuiz && !showVideoQuiz && !triggeredQuizzes.has(current)) {
            playerRef.current.pauseVideo();
            setActivePopupQuiz(matchingQuiz);
            setShowVideoQuiz(true);
            setTriggeredQuizzes(prev => new Set(prev).add(current));
            
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(matchingQuiz.question);
              window.speechSynthesis.speak(u);
            }
          }
        }
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const handleVideoQuizAnswer = (idx) => {
    if (idx === activePopupQuiz.correct) {
      toast.success("Sahi Jawab! Video resuming... 🎉");
      setShowVideoQuiz(false);
      setActivePopupQuiz(null);
      playerRef.current.playVideo();
    } else {
      toast.error("Galat Jawab! Firse try karo.");
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

  const toggleListening = (targetSentence) => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Tumhara browser Speech Recognition support nahi karta. Try Chrome!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true; 
    recognition.maxAlternatives = 1;
    recognition.onstart = () => { setIsListening(true); setSpokenText(""); setSpeakingResult(null); };
    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results).map(result => result[0].transcript).join('');
      setSpokenText(currentTranscript);
      const latestResult = event.results[event.results.length - 1];
      if (latestResult.isFinal) checkPronunciation(currentTranscript, targetSentence);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'no-speech') toast.error("Awaaz nahi aayi! Thoda zor se bolo. 🎤");
    };
    recognition.onend = () => { setIsListening(false); };
    recognition.start();
  };

  const toggleChapter = (id) => setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleLesson = (id) => setExpandedLessons(prev => ({ ...prev, [id]: !prev[id] }));
  
  const closeLesson = () => {
    setActiveVideoLesson(null);
    setTriggeredQuizzes(new Set()); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2EFE7] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8B004A] mb-4"></div>
          <p className="text-[#8B004A] font-black text-sm uppercase tracking-widest">Loading Syllabus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EFE7] text-gray-900 flex justify-center font-sans pb-28 transition-colors duration-500">
      <Toaster position="top-center" toastOptions={{ style: { background: '#8B004A', color: '#F2EFE7', border: '1px solid #E01A76', fontWeight: 'bold' } }} />
      <div className="w-full max-w-md bg-[#F2EFE7] relative px-4">
        
        {/* =========================================
            VIEW A: MAIN SYLLABUS MENU
        ============================================= */}
        {!activeVideoLesson && !activeQuizLesson && !activeSpeakingLesson && (
          <div className="animate-fade-in pt-8 pb-10">
            <div className="mb-6 pl-2">
              <span className="text-[#8B004A] text-[10px] uppercase tracking-widest font-black bg-[#8B004A]/10 px-3 py-1.5 rounded-md border border-[#8B004A]/20 shadow-sm">Dameeto Academy</span>
              <h1 className="text-3xl font-black mt-3 tracking-wide text-[#8B004A] drop-shadow-sm">Your Syllabus</h1>
              <div className="flex gap-3 mt-5">
                <div className="flex-1 bg-white border-2 border-gray-100 hover:border-[#8B004A]/30 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="bg-[#8B004A]/10 p-2.5 rounded-xl text-[#8B004A]"><Layers size={18} strokeWidth={2.5} /></div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-0.5">Units</span>
                    <span className="text-sm font-black text-gray-900">{totalUnits} Modules</span>
                  </div>
                </div>
                <div className="flex-1 bg-white border-2 border-gray-100 hover:border-[#FFB800]/30 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="bg-[#FFB800]/20 p-2.5 rounded-xl text-[#FFB800]"><Play size={18} strokeWidth={2.5} /></div>
                  <div>
                    <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block mb-0.5">Lectures</span>
                    <span className="text-sm font-black text-gray-900">{totalLectures} Sessions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl mb-8 border border-gray-200 shadow-md ml-2 mr-2 relative z-10">
              <button onClick={() => setActiveTab('grammar')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider ${activeTab === 'grammar' ? 'bg-[#8B004A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                <BookOpen size={16} strokeWidth={activeTab === 'grammar' ? 2.5 : 2} /> Grammar Book
              </button>
              <button onClick={() => setActiveTab('realLife')} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider ${activeTab === 'realLife' ? 'bg-[#FFB800] text-[#4A0027] shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                <MessageSquare size={16} strokeWidth={activeTab === 'realLife' ? 2.5 : 2} /> Real-Life Talk
              </button>
            </div>

            <div className="relative border-l-4 border-gray-200 ml-4 space-y-8 animate-fade-in key={activeTab}">
              {activeCourseData.length === 0 ? (
                 <p className="text-gray-400 text-center text-sm font-bold mt-10">No chapters found yet.</p>
              ) : (
                activeCourseData.map((chapter) => {
                  const isChapterExpanded = !!expandedChapters[chapter._id || chapter.id];
                  const dotColor = activeTab === 'grammar' ? 'border-[#8B004A]' : 'border-[#FFB800]';
                  const textColor = activeTab === 'grammar' ? 'group-hover:text-[#E01A76]' : 'group-hover:text-[#FFB800]';

                  return (
                    <div key={chapter._id || chapter.id} className="relative pl-6">
                      <div className={`absolute -left-[10px] top-2 h-4 w-4 rounded-full border-[4px] bg-white ${dotColor} z-10`}></div>
                      <div onClick={() => toggleChapter(chapter._id || chapter.id)} className="cursor-pointer group flex items-start justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                        <div>
                          <h2 className={`text-lg font-black text-gray-900 tracking-wide transition-colors ${textColor}`}>{chapter.title}</h2>
                          <p className="text-gray-500 text-[10px] uppercase mt-1 font-bold tracking-widest">{chapter.subtitle}</p>
                        </div>
                        <div className="mt-1 bg-gray-50 p-2 rounded-full border border-gray-200">
                          {isChapterExpanded ? <ChevronDown size={14} strokeWidth={3} className={activeTab==='grammar'?'text-[#8B004A]':'text-[#FFB800]'} /> : <ChevronRight size={14} strokeWidth={3} className="text-gray-400" />}
                        </div>
                      </div>

                      {isChapterExpanded && (
                        <div className="mt-5 space-y-5 relative animate-fade-in">
                          {chapter.lessons && chapter.lessons.map((lesson) => {
                            const isLessonExpanded = !!expandedLessons[lesson._id || lesson.id];
                            
                            return (
                              <div key={lesson._id || lesson.id} className="relative pl-5">
                                <div className="absolute -left-[22px] top-0 bottom-0 w-6 border-l-4 border-b-4 border-gray-200 rounded-bl-xl h-4 z-0"></div>
                                <div className="absolute -left-[4px] top-2.5 h-2.5 w-2.5 rounded-full bg-gray-400 border-[2px] border-[#F2EFE7] z-10"></div>
                                <div onClick={() => toggleLesson(lesson._id || lesson.id)} className="flex items-center justify-between cursor-pointer group bg-white/60 hover:bg-white p-3.5 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all shadow-sm">
                                  <div>
                                    <h3 className="text-sm font-black text-gray-700">{lesson.title}</h3>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase block mt-1 tracking-wider">{lesson.duration}</span>
                                  </div>
                                  {isLessonExpanded ? <ChevronDown size={14} className="text-gray-400" strokeWidth={2.5} /> : <ChevronRight size={14} className="text-gray-400" strokeWidth={2.5} />}
                                </div>

                                {isLessonExpanded && (
                                  <div className="mt-3 pl-3 space-y-2.5 relative border-l-2 border-dashed border-gray-300 ml-1">
                                    {lesson.videoId && (
                                      <button onClick={() => setActiveVideoLesson(lesson)} className="w-full relative flex items-center justify-between bg-white hover:bg-gray-50 border-2 border-gray-100 p-3.5 rounded-xl transition-all shadow-sm active:scale-95 group">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${activeTab === 'grammar' ? 'bg-[#8B004A] text-white' : 'bg-[#FFB800] text-[#4A0027]'}`}><Play size={14} className="fill-current" /></div>
                                          <span className="text-xs font-black uppercase tracking-wider text-gray-600">Watch Session</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-900" strokeWidth={3} />
                                      </button>
                                    )}
                                    {lesson.standaloneQuiz && lesson.standaloneQuiz.length > 0 && (
                                      <button onClick={() => { setActiveQuizLesson(lesson); setCurrentQuizIndex(0); }} className="w-full relative flex items-center justify-between bg-white hover:bg-[#E01A76]/5 border-2 border-gray-100 hover:border-[#E01A76]/40 p-3.5 rounded-xl transition-all shadow-sm active:scale-95 group">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-[#E01A76]/10 flex items-center justify-center text-[#E01A76] shadow-sm"><HelpCircle size={14} strokeWidth={2.5} /></div>
                                          <span className="text-xs font-black uppercase tracking-wider text-gray-600 group-hover:text-[#E01A76]">Quick Test</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400 group-hover:text-[#E01A76]" strokeWidth={3} />
                                      </button>
                                    )}
                                    {lesson.speakingData && lesson.speakingData.hindi && lesson.speakingData.english && (
                                      <button onClick={() => { setActiveSpeakingLesson(lesson); setSpokenText(""); setSpeakingResult(null); }} className="w-full relative flex items-center justify-between bg-white hover:bg-[#10B981]/5 border-2 border-gray-100 hover:border-[#10B981]/40 p-3.5 rounded-xl transition-all shadow-sm active:scale-95 group">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shadow-sm"><Mic size={14} strokeWidth={2.5} /></div>
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
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================
            VIEW B: VIDEO THEATER MODE
        ============================================= */}
        {activeVideoLesson && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-white border-b-2 border-gray-200 shadow-sm">
              <button onClick={closeLesson} className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200"><ChevronDown className="rotate-90" size={18} strokeWidth={2.5} /></button>
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
                Video sync tracker is running. Interactive check-points will pause the video automatically.
              </p>
              
              {activeVideoLesson.videoQuizzes && activeVideoLesson.videoQuizzes.map((vq, index) => (
                <div key={index} className="mt-5 bg-white border-2 border-[#8B004A]/10 rounded-xl p-4.5 flex items-center gap-4 shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${activeTab === 'grammar' ? 'bg-[#8B004A]/10 text-[#8B004A]' : 'bg-[#FFB800]/20 text-[#FFB800]'}`}><Compass size={20} strokeWidth={2.5} /></div>
                  <div>
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-0.5">Checkpoint {index + 1}</span>
                    <p className="text-sm font-black text-gray-800">Halts at <span className="text-[#E01A76]">{vq.time}s</span></p>
                  </div>
                </div>
              ))}
            </div>

            {showVideoQuiz && activePopupQuiz && (
              <div className="absolute inset-0 z-[100] bg-[#4A0027]/70 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-full bg-white border-[4px] border-white/50 rounded-[2rem] p-6 shadow-2xl relative text-center">
                  <span className={`text-[10px] uppercase font-black tracking-[0.2em] mb-3 block ${activeTab === 'grammar' ? 'text-[#8B004A]' : 'text-[#FFB800]'}`}>Live Video Question</span>
                  <p className="text-gray-900 font-black text-xl mb-8 leading-snug drop-shadow-sm">{activePopupQuiz.question}</p>
                  <div className="grid gap-3">
                    {activePopupQuiz.options.map((opt, idx) => (
                      <button key={idx} onClick={() => handleVideoQuizAnswer(idx)} className="w-full bg-gray-50 hover:bg-[#8B004A] text-gray-700 hover:text-white py-4 px-5 rounded-2xl text-sm font-black border-2 border-gray-200 flex justify-between items-center group shadow-sm">
                        <span>{opt}</span><ChevronRight size={16} className="text-gray-400 group-hover:text-white" strokeWidth={3} />
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
        {activeQuizLesson && activeQuizLesson.standaloneQuiz && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in p-4">
            <div className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-6 shadow-sm mt-4">
              <button onClick={() => { setActiveQuizLesson(null); setCurrentQuizIndex(0); }} className="text-[10px] font-black uppercase tracking-wider bg-gray-100 px-3.5 py-2 rounded-xl text-gray-500">✕ Exit</button>
              <div className="text-center">
                <span className="text-[9px] font-black text-[#E01A76] uppercase tracking-widest block">Standalone Module</span>
                <p className="text-sm font-black text-gray-800 truncate max-w-[140px]">{activeQuizLesson.title}</p>
              </div>
              <span className="text-[11px] font-black bg-[#E01A76] text-white px-3 py-1.5 rounded-lg shadow-sm">Q: {currentQuizIndex + 1} / {activeQuizLesson.standaloneQuiz.length}</span>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
              <div className="bg-white border-2 border-gray-100 rounded-[2rem] p-8 text-center shadow-xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E01A76]"></div>
                <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Analyze Syntax Structure</span>
                <p className="text-xl md:text-2xl font-black text-[#8B004A] leading-normal px-2 drop-shadow-sm">"{activeQuizLesson.standaloneQuiz[currentQuizIndex].q}"</p>
                <div className="grid gap-3 pt-6 w-full">
                  {activeQuizLesson.standaloneQuiz[currentQuizIndex].o.map((option, idx) => (
                    <button key={idx} onClick={() => handleStandaloneQuizAnswer(idx, activeQuizLesson.standaloneQuiz[currentQuizIndex].c)} className="w-full bg-gray-50 hover:bg-[#8B004A] text-gray-700 hover:text-white border-2 border-gray-200 py-4.5 px-6 rounded-2xl text-sm font-black flex justify-between items-center group shadow-sm">
                      <span>{option}</span><ChevronRight size={16} className="text-gray-400 group-hover:text-white" strokeWidth={3} />
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
        {activeSpeakingLesson && activeSpeakingLesson.speakingData && (
          <div className="fixed inset-0 z-50 flex flex-col bg-[#F2EFE7] w-full max-w-md mx-auto h-screen animate-fade-in p-4">
            <div className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl p-4 mb-6 shadow-sm mt-4">
              <button onClick={() => { setActiveSpeakingLesson(null); setIsListening(false); if(recognitionRef.current) recognitionRef.current.stop(); }} className="text-[10px] font-black uppercase tracking-wider bg-gray-100 px-3.5 py-2 rounded-xl text-gray-500">✕ Exit</button>
              <div className="text-center flex-1">
                <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest block">Voice Engine</span>
                <p className="text-sm font-black text-gray-800 truncate mt-0.5">{activeSpeakingLesson.title}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative">
              <div className="bg-white border-2 border-[#10B981]/20 rounded-3xl p-6 shadow-lg text-center w-full max-w-[90%] relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white text-[9px] uppercase font-black px-4 py-1 rounded-full shadow-md tracking-widest">Translate this</div>
                <p className="text-2xl font-black text-gray-800 mt-4 mb-4 leading-relaxed">"{activeSpeakingLesson.speakingData.hindi}"</p>
                <button onClick={() => speakEnglishSentence(activeSpeakingLesson.speakingData.english)} className="mx-auto flex items-center justify-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                  <Volume1 size={14} /> Answer sunne ke liye tap karein
                </button>
              </div>

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

              <div className="mt-10 mb-8">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleListening(activeSpeakingLesson.speakingData.english); }} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isListening ? 'bg-[#10B981] text-white scale-110 shadow-[#10B981]/40 animate-pulse' : 'bg-white text-gray-400 border-[4px] border-gray-100'}`}>
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