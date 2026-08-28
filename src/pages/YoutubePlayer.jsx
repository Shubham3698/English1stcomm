import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Search, FileText, PlaySquare, Clock, FastForward, Volume2, Plus, X, Bookmark, ArrowRight, ChevronLeft, Layers } from "lucide-react";

export default function YoutubePlayer() {
  const [inputUrl, setInputUrl] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [script, setScript] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); 
  
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);
  const activeLineRef = useRef(null);
  const popupRef = useRef(null);

  const API_URL = "http://localhost:3000"; 

  const [savedWords, setSavedWords] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const [selectedStream, setSelectedStream] = useState(null);
  
  const [popup, setPopup] = useState({ 
    visible: false, 
    phrase: '', 
    context: '', 
    x: 0, 
    y: 0,
    isAddingMode: false,
    timestamp: 0 
  });

  useEffect(() => {
    const fetchSavedVocab = async () => {
      const userEmail = localStorage.getItem("eng_userEmail") || "guest_user@gmail.com";
      try {
        const res = await fetch(`${API_URL}/api/ytbucket/vocab?email=${userEmail}`);
        if(res.ok) {
          const data = await res.json();
          if(data.vocab) setSavedWords(data.vocab);
        }
      } catch (error) {
        console.log("Could not fetch old words");
      }
    };
    fetchSavedVocab();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.script-word')) return;
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopup((prev) => ({ ...prev, visible: false, isAddingMode: false }));
        window.getSelection().removeAllRanges();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    return () => {
      if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
    };
  }, []);

  useEffect(() => {
    if (!activeVideoUrl) return;

    const initPlayer = () => {
      const safeVideoId = getYouTubeID(activeVideoUrl);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player('live-video-frame', {
        height: '100%',
        width: '100%',
        videoId: safeVideoId,
        playerVars: { 'controls': 1, 'rel': 0, 'modestbranding': 1, 'playsinline': 1 },
        events: {
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              timeUpdateInterval.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  setCurrentTime(playerRef.current.getCurrentTime());
                }
              }, 300);
            } else {
              setIsPlaying(false);
              if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      setTimeout(initPlayer, 150);
    } else {
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          setTimeout(initPlayer, 150);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [activeVideoUrl]);

  const loadVideoAndScript = async (urlToLoad) => {
    if (!urlToLoad) return false;
    setInputUrl(urlToLoad);
    setActiveVideoUrl(urlToLoad);
    setLoading(true); setError(""); setScript([]);
    setIsPlaying(false); setCurrentTime(0);

    try {
      const response = await axios.post(`${API_URL}/api/ytbucket/get-transcript`, { videoUrl: urlToLoad });
      if (response.data.success) {
        setScript(response.data.script);
        return true; 
      }
    } catch (err) {
      setError(err.response?.data?.error || "Captions not found for this video.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleFetchVideo = () => {
    if (!inputUrl.trim()) return;
    loadVideoAndScript(inputUrl.trim());
  };

  const formatTime = (seconds) => {
    const date = new Date(Math.round(seconds) * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString().padStart(2, '0');
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh > 0) return `${hh}:${mm}:${ss}`;
    return `${mm}:${ss}`;
  };

  const handleSeek = (timeInSeconds) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(timeInSeconds, true);
      playerRef.current.playVideo(); 
      setIsPlaying(true);
    }
  };

  const speakWord = (text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleWordClick = (e, word, fullContext, timestamp) => {
    e.stopPropagation();
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim().toLowerCase();
    if (!cleanWord) return;

    const popupWidth = 280;
    const popupHeight = 180;
    let x = e.clientX - popupWidth / 2;
    let y = e.clientY - popupHeight - 20; 
    
    if (x < 10) x = 10;
    if (x + popupWidth > window.innerWidth) x = window.innerWidth - popupWidth - 10;
    if (y < 10) y = e.clientY + 30; 

    setPopup(prev => {
      if (prev.isAddingMode) {
        return {
          ...prev,
          phrase: `${prev.phrase} ${cleanWord}`, 
          isAddingMode: false, 
          x, y
        };
      } else {
        return {
          visible: true, 
          phrase: cleanWord, 
          context: fullContext, 
          x, y,
          isAddingMode: false,
          timestamp 
        };
      }
    });
  };

  const enableAddingMode = (e) => {
    e.stopPropagation();
    setPopup(prev => ({ ...prev, isAddingMode: true }));
    toast("Tap next word to combine...", { icon: '👆', style: { background: '#333', color: '#fff', borderRadius: '20px' } });
  };

  const handleSaveToBucket = async () => {
    setIsSaving(true);
    const userEmail = localStorage.getItem("eng_userEmail") || "guest_user@gmail.com";

    try {
      const response = await fetch(`${API_URL}/api/ytbucket/add-vocab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: popup.phrase,
          context: popup.context,
          videoUrl: activeVideoUrl, 
          timestamp: popup.timestamp, 
          userEmail: userEmail
        })
      });

      if (response.ok) {
        toast.success(`'${popup.phrase}' saved to YT Bucket! 🎯`);
        setSavedWords(prev => [{ word: popup.phrase, context: popup.context, videoUrl: activeVideoUrl, timestamp: popup.timestamp }, ...prev]);
        setPopup((prev) => ({ ...prev, visible: false, isAddingMode: false }));
      } else {
        toast.error(`Failed to save ❌`);
      }
    } catch (error) {
      toast.error(`Network Error ❌`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleJumpToPhrase = async (savedItem) => {
    if (savedItem.timestamp !== undefined) {
      if (savedItem.videoUrl && savedItem.videoUrl !== activeVideoUrl) {
        toast.success("Loading that stream... 🎬");
        const success = await loadVideoAndScript(savedItem.videoUrl);
        if (success) {
          setTimeout(() => handleSeek(savedItem.timestamp), 1500); 
          setIsDrawerOpen(false);
        }
      } else {
        handleSeek(savedItem.timestamp);
        setIsDrawerOpen(false);
        toast.success("Jumped to exact moment! 🎬");
      }
    } else {
      toast.error("Timestamp not available for this word.");
    }
  };

  let activeIndex = -1;
  for (let i = 0; i < script.length; i++) {
    const isLast = i === script.length - 1;
    const nextStart = isLast ? Infinity : script[i + 1].start;
    if (currentTime >= script[i].start && currentTime < nextStart) {
      activeIndex = i;
      break;
    }
  }

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex]);

  const groupedStreams = {};
  savedWords.forEach(item => {
    const url = item.videoUrl || "Unknown Stream";
    if (!groupedStreams[url]) {
      groupedStreams[url] = [];
    }
    groupedStreams[url].push(item);
  });

  return (
    <div className="min-h-screen bg-[#F2EFE7] flex flex-col items-center p-6 font-sans relative">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-4xl mb-8 text-center mt-6">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
          <PlaySquare size={40} className="text-[#E01A76]" />
          Stream<span className="text-transparent bg-clip-text bg-gradient-to-br from-[#8B004A] to-[#E01A76]">Sync</span>
        </h1>
        <p className="text-gray-500 font-bold mt-2">Interactive Transcript & Video Player</p>
      </div>

      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md p-2 rounded-[2.5rem] shadow-sm flex items-center border border-white mb-8 focus-within:border-[#E01A76]/50 transition-all z-10 relative">
        <div className="pl-6 pr-2 text-[#8B004A]">
          <Search size={24} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="Paste YouTube Link (e.g. https://youtu.be/...)"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFetchVideo()}
          className="flex-1 bg-transparent border-none outline-none py-4 text-lg font-bold text-gray-900 placeholder:text-gray-400 truncate w-full"
        />
        <button
          onClick={handleFetchVideo}
          disabled={loading || !inputUrl.trim()}
          className="bg-gradient-to-r from-[#E01A76] to-[#8B004A] text-white px-8 h-[56px] rounded-[2rem] font-black text-[15px] flex items-center justify-center gap-2 shadow-md border-b-4 border-[#600033] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-70"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <><FastForward size={18}/> Stream</>}
        </button>
      </div>

      <div className="w-full max-w-[1400px] grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-4 shadow-xl border border-white h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[#8B004A] font-black text-xl flex items-center gap-2">
                <PlaySquare size={22} strokeWidth={2.5} /> Now Playing
              </h2>
              {activeVideoUrl && (
                <span className="bg-[#E01A76]/10 text-[#E01A76] px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-[#E01A76]/20 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#E01A76] animate-pulse' : 'bg-gray-400'}`}></span> 
                  {isPlaying ? 'Live Sync' : 'Paused'}
                </span>
              )}
            </div>
            
            <div className="w-full flex-1 rounded-[1.5rem] overflow-hidden bg-black shadow-inner relative min-h-[300px] sm:min-h-[400px] md:min-h-[500px] z-0">
              {activeVideoUrl ? (
                <div id="live-video-frame" className="absolute inset-0 w-full h-full pointer-events-auto"></div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 font-bold bg-gradient-to-br from-gray-900 to-black">
                  <PlaySquare size={48} className="mb-4 opacity-20" />
                  <p>Awaiting video connection...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 flex flex-col gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-xl border border-white h-[500px] xl:h-[600px] flex flex-col relative">
            <div className="flex items-center justify-between mb-4 border-b-2 border-gray-100 pb-4">
              <h2 className="text-gray-900 font-black text-xl flex items-center gap-2">
                <FileText size={22} className="text-[#FFB800]" strokeWidth={2.5}/> Transcript
              </h2>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Live Sync</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
              {loading ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#8B004A] gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#8B004A]/10 flex items-center justify-center border-2 border-[#8B004A]/20">
                    <Loader2 size={32} className="animate-spin text-[#8B004A]" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest">Extracting Timestamps...</p>
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center text-rose-500 font-bold text-center bg-rose-50/50 p-6 rounded-2xl border-2 border-rose-100 border-dashed">
                  {error}
                </div>
              ) : script.length > 0 ? (
                <div className="flex flex-col gap-2 relative">
                  {script.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <div 
                        key={index} 
                        ref={isActive ? activeLineRef : null}
                        className={`group flex gap-3 items-start p-3.5 rounded-2xl transition-all border ${
                          isActive 
                            ? "bg-[#E01A76]/10 border-[#E01A76]/40 shadow-sm scale-[1.02]" 
                            : "hover:bg-[#8B004A]/5 border-transparent hover:border-[#8B004A]/20 hover:shadow-sm"
                        }`}
                      >
                        <button 
                          onClick={() => handleSeek(item.start)}
                          className={`${
                            isActive ? "bg-[#E01A76] text-white animate-pulse" : "bg-[#8B004A] hover:bg-[#E01A76] text-white"
                          } px-2.5 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1 shrink-0 transition-colors shadow-sm cursor-pointer z-10 active:scale-90`}
                        >
                          <Clock size={12} strokeWidth={3}/> {formatTime(item.start)}
                        </button>
                        
                        <p className={`text-[15px] font-bold leading-relaxed transition-colors flex-1 flex flex-wrap gap-x-1 ${
                          isActive ? "text-[#8B004A]" : "text-gray-700"
                        }`}>
                          {item.text.split(' ').map((word, wIdx) => {
                            const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim().toLowerCase();
                            const isSelected = popup.visible && popup.context === item.text && popup.phrase.includes(cleanWord);
                            const isSaved = savedWords.some(sw => sw.word.toLowerCase().includes(cleanWord));
                            
                            return (
                              <span 
                                key={wIdx}
                                onClick={(e) => handleWordClick(e, word, item.text, item.start)}
                                className={`script-word cursor-pointer px-[2px] rounded transition-all duration-200 inline-block ${
                                  isSelected 
                                    ? 'bg-[#FFB800] text-[#8B004A] font-black shadow-sm scale-110'
                                    : isSaved 
                                      ? 'text-[#E01A76] hover:bg-[#FFB800]/40' 
                                      : 'hover:bg-[#FFB800]/40 hover:text-[#8B004A]'
                                }`}
                              >
                                {word}
                              </span>
                            )
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-center text-sm">
                  Video loaded will map transcript timeline here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {popup.visible && !popup.isAddingMode && (
        <div 
          ref={popupRef}
          style={{ top: popup.y, left: popup.x }}
          className="fixed z-50 bg-white/95 backdrop-blur-xl border border-white w-[280px] rounded-2xl shadow-[0_20px_50px_rgba(139,0,74,0.25)] flex flex-col overflow-hidden animate-fade-in-up"
        >
          <div className="bg-gradient-to-r from-[#8B004A] to-[#E01A76] px-4 py-3.5 flex items-center relative">
            <span className="text-white font-black text-[18px] tracking-wide lowercase truncate flex-1 drop-shadow-md">
              {popup.phrase}
            </span>
            <button 
              onClick={enableAddingMode}
              className="p-1.5 bg-[#FFB800] text-[#8B004A] hover:bg-[#F0AD00] rounded-xl transition-transform active:scale-90 shadow-sm flex items-center gap-1"
              title="Combine next word"
            >
              <Plus size={18} strokeWidth={4}/>
            </button>
            <button 
              onClick={() => { setPopup({visible: false, isAddingMode: false}); window.getSelection().removeAllRanges(); }} 
              className="text-white/80 hover:text-white p-1.5 ml-1 active:scale-90 transition-transform"
            >
              <X size={20} strokeWidth={3}/>
            </button>
          </div>
          
          <div className="flex flex-col p-4 gap-3 bg-[#F2EFE7]/50">
            <div className="flex gap-2">
              <button 
                onClick={() => speakWord(popup.phrase)}
                disabled={isPlayingAudio}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#FFB800] hover:bg-[#FFB800]/10 hover:text-[#8B004A] transition-all text-gray-700 text-[13px] font-black shadow-sm disabled:opacity-50 active:scale-95"
              >
                <Volume2 size={18} strokeWidth={2.5}/> Phrase
              </button>
              <button 
                onClick={() => speakWord(popup.context)}
                disabled={isPlayingAudio}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#FFB800] hover:bg-[#FFB800]/10 hover:text-[#8B004A] transition-all text-gray-700 text-[13px] font-black shadow-sm disabled:opacity-50 active:scale-95"
              >
                <Volume2 size={18} strokeWidth={2.5}/> Line
              </button>
            </div>
            
            <button 
              onClick={handleSaveToBucket}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#8B004A] hover:bg-[#E01A76] transition-all text-white text-[15px] font-black shadow-[0_5px_15px_rgba(139,0,74,0.3)] mt-1 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} strokeWidth={3}/>}
              {isSaving ? 'Saving...' : 'Add to Bucket'}
            </button>
          </div>
        </div>
      )}

      {/* 🔥 FLOATING ACTION BUTTON 🔥 */}
      <button 
        onClick={() => { setIsDrawerOpen(true); setSelectedStream(null); }}
        className="fixed bottom-10 right-10 z-40 bg-gradient-to-r from-[#FFB800] to-[#F0AD00] text-[#8B004A] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        <Layers size={28} strokeWidth={2.5} />
        {Object.keys(groupedStreams).length > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#E01A76] text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {Object.keys(groupedStreams).length}
          </span>
        )}
      </button>

      {/* 🔥 SAVED WORDS SIDEBAR / DRAWER 🔥 */}
      <div className={`fixed inset-0 bg-[#4A0027]/40 backdrop-blur-sm z-[110] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setIsDrawerOpen(false)} />
      
      <div className={`fixed top-0 right-0 h-full w-[90%] max-w-[360px] bg-[#F2EFE7] border-l-4 border-[#8B004A] z-[120] transform transition-transform duration-500 ease-in-out flex flex-col shadow-2xl ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="bg-white p-6 flex justify-between items-center border-b border-gray-200">
          {selectedStream ? (
            <button 
              onClick={() => setSelectedStream(null)} 
              className="flex items-center gap-1 text-[#8B004A] font-black hover:text-[#E01A76] transition-colors"
            >
              <ChevronLeft size={20} strokeWidth={3} /> Back to Streams
            </button>
          ) : (
            <h2 className="text-xl font-black text-[#8B004A] flex items-center gap-2">
              <Layers size={20} /> My Streams
            </h2>
          )}
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
            <X size={20} strokeWidth={2.5}/>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedWords.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
              <Layers size={48} className="mb-4" />
              <p className="font-bold text-lg">No streams yet</p>
              <p className="text-sm">Click any word in the transcript to create your first stream collection.</p>
            </div>
          ) : selectedStream === null ? (
            Object.keys(groupedStreams).map((url, idx) => {
              const vidId = getYouTubeID(url);
              const thumbnail = vidId ? `https://img.youtube.com/vi/${vidId}/mqdefault.jpg` : 'https://via.placeholder.com/300x169.png?text=Unknown+Video';
              const wordsCount = groupedStreams[url].length;

              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    setSelectedStream(url);
                    if (activeVideoUrl !== url) {
                      toast.success("Loading Stream & Script... 🎬");
                      loadVideoAndScript(url);
                    }
                  }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#FFB800] transition-all cursor-pointer group overflow-hidden"
                >
                  <div className="h-28 w-full relative bg-gray-200">
                    <img src={thumbnail} alt="Video Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                       <span className="text-white text-xs font-black bg-[#E01A76] px-2 py-1 rounded-lg shadow-sm">
                         {wordsCount} {wordsCount === 1 ? 'Word' : 'Words'} Saved
                       </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white flex justify-between items-center">
                    <p className="text-sm font-bold text-gray-700 truncate pr-2">Stream #{idx + 1}</p>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-[#8B004A]" strokeWidth={2.5} />
                  </div>
                </div>
              );
            })
          ) : (
            // 🚀 VIEW 2: UPDATED CLEAN UI (Word + Context + Play icon mapped correctly)
            groupedStreams[selectedStream].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => handleJumpToPhrase(item)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#FFB800] hover:shadow-md transition-all group flex flex-col gap-2 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 🚀 Pronounce Button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakWord(item.word); }}
                      className="w-8 h-8 shrink-0 rounded-full bg-[#8B004A]/10 text-[#8B004A] hover:bg-[#E01A76] hover:text-white flex items-center justify-center transition-colors shadow-sm"
                      title="Pronounce Word"
                    >
                      <Volume2 size={16} strokeWidth={2.5} />
                    </button>
                    {/* 🚀 Word */}
                    <h3 className="font-black text-[#8B004A] text-lg group-hover:text-[#E01A76] transition-colors">
                      {item.word}
                    </h3>
                  </div>
                  {/* 🚀 Play Indicator */}
                  <div className="bg-gray-50 p-2 rounded-xl group-hover:bg-[#FFB800]/20 transition-colors">
                    <PlaySquare size={14} className="text-gray-400 group-hover:text-[#8B004A]" strokeWidth={3}/>
                  </div>
                </div>
                {/* 🚀 Context (Sentence) right below word */}
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed ml-[44px] italic">
                  "{item.context}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}