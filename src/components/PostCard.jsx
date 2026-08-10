import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
// 🔥 UPDATED: useParams import add kiya hai
import { useSearchParams, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// 🔥 NAYA IMPORT: Capacitor TextToSpeech (Smart Audio ke liye)
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { Capacitor } from '@capacitor/core';

import 'swiper/css';
import 'swiper/css/pagination';

import CommentModal from "./CommentModal"; 
import PremiumSoundFeature from "./PremiumSoundFeature"; 

import { Sparkles, Play, RefreshCcw, Volume2, MessageCircle, Heart, Share2, Bookmark } from "lucide-react";

// 🔥 DYNAMIC HIGHLIGHT ENGINE - Clean & Subtle
const highlightText = (text, highlight) => {
  if (!text || !highlight) return text;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = String(text).split(regex);
  
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span 
        key={i} 
        className="bg-[#FFB800]/15 text-[#8B004A] font-playful font-bold px-1.5 py-0.5 rounded-md mx-0.5 border border-[#FFB800]/30 inline-block"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};

export default function PostCard({ 
  post, 
  userEmail, 
  isPremiumUser, 
  activeIndex, 
  setActiveIndex, 
  onRefresh, 
  API_URL,
  highlightWord: propHighlight 
}) {
  const [showComments, setShowComments] = useState(false);
  const [showStats, setShowStats] = useState(false); 
  const [currentVocabIdx, setCurrentVocabIdx] = useState(0); 
  const [globalSlideIndex, setGlobalSlideIndex] = useState(0); // Track for smart dots
  const [playingIndex, setPlayingIndex] = useState({}); 
  const [searchParams] = useSearchParams(); 
  
  // 🔥 NEW: Path se ID nikalne ke liye
  const { postId: urlParamId } = useParams();

  const swiperRef = useRef(null);
  const cardRef = useRef(null); 

  const [activeCommentIdx, setActiveCommentIdx] = useState(0);
  const [commentFade, setCommentFade] = useState(true);

  const [isFlipped, setIsFlipped] = useState(false);
  const [hasHintPlayed, setHasHintPlayed] = useState(false);

  // 🔥 SMART DOTS FADE LOGIC STATES 🔥
  const [showDots, setShowDots] = useState(false);
  const dotsTimerRef = useRef(null);

  const triggerDotsVisibility = useCallback(() => {
    setShowDots(true);
    if (dotsTimerRef.current) clearTimeout(dotsTimerRef.current);
    dotsTimerRef.current = setTimeout(() => {
      setShowDots(false);
    }, 2000); // 2 seconds ke baad smoothly gayab ho jayega
  }, []);

  // Cleanup dots timer on unmount
  useEffect(() => {
    return () => {
      if (dotsTimerRef.current) clearTimeout(dotsTimerRef.current);
    };
  }, []);

  const deck = useMemo(() => {
    return post.vocabData && post.vocabData.length > 0 
      ? post.vocabData 
      : [{ 
          _id: post._id, 
          word: post.word, 
          meaning: post.meaning, 
          sentence: post.sentence || "", 
          media: post.media || (post.image ? [{type:'image', url: post.image}] : []), 
          wordStats: post.userStats, 
          votedBy: post.votedBy, 
          voteCount: post.voteCount, 
          commandStats: post.commandStats 
        }];
  }, [post]);

  useEffect(() => {
    setIsFlipped(false);
    setHasHintPlayed(false);
  }, [currentVocabIdx]);

  const { mediaItems, slideToVocabMap } = useMemo(() => {
    const items = [];
    const map = [];
    deck.forEach((vocab, vIdx) => {
      if (vocab.media && vocab.media.length > 0) {
        vocab.media.forEach((m) => {
          const mediaUrl = m.url || m.value;
          if(mediaUrl) {
            items.push({ ...m, url: mediaUrl, vocabIndex: vIdx, word: vocab.word });
            map.push(vIdx);
          }
        });
      }
    });
    return { mediaItems: items, slideToVocabMap: map };
  }, [deck]);

  const defaultEngagementComments = useMemo(() => [
    { name: "System", text: "A highly useful word for everyday conversations! 💯", isBot: true },
    { name: "Learner", text: "Adding this to my notes. Very helpful! 📚", isBot: true },
    { name: "Mentor", text: "Try making your own sentence with this word! ✍️", isBot: true }
  ], []);

  const displayComments = useMemo(() => {
    return post.comments && post.comments.length > 0 ? post.comments : defaultEngagementComments;
  }, [post.comments, defaultEngagementComments]);

  const totalComments = displayComments.length;
  useEffect(() => {
    if (totalComments > 0) {
      const interval = setInterval(() => {
        setCommentFade(false);
        setTimeout(() => {
          setActiveCommentIdx((prev) => (prev + 1) % totalComments);
          setCommentFade(true);
        }, 500);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [totalComments]);

  // 🔥 SIRF YEH CHANGE HUA HAI: SMART PRONUNCIATION LOGIC (NATIVE + WEB) 🔥
  const speakWord = useCallback(async (word) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await TextToSpeech.speak({
          text: word,
          lang: 'en-US',
          rate: 0.85,
          pitch: 1.1,
          volume: 1.0,
        });
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.lang = 'en-US'; 
          u.rate = 0.85; 
          u.pitch = 1.1; 
          window.speechSynthesis.speak(u);
        }
      }
    } catch (err) {
      console.error("Audio Playback Error:", err);
      toast.error("Audio error. Make sure volume is up.");
    }
  }, []);

  // ✅ BUG FIX: Yahan auto-play useEffect delete kar diya gaya hai! Ab bhoot nahi bolega!

  const handleWordSelect = useCallback((idx) => {
    setCurrentVocabIdx(idx);
    const firstSlideOfWord = slideToVocabMap.indexOf(idx);
    
    if (firstSlideOfWord !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(firstSlideOfWord, 500);
      triggerDotsVisibility(); // Tab change hone pe bhi dots dikhenge
    }

    // 🔥 BUG FIX: Sirf tabhi bolega jab user click/tap karega 🔥
    if (deck[idx]?.word) {
      speakWord(deck[idx].word);
    }
  }, [slideToVocabMap, triggerDotsVisibility, deck, speakWord]);

  // ✨ UPDATED: SCROLL EFFECT (Smart Scroll Logic) ✨
  useEffect(() => {
    const feedPostId = searchParams.get("postId");
    const urlPostId = feedPostId || urlParamId;
    const isFeedView = !!feedPostId; 

    if (urlPostId === post._id) {
      setTimeout(() => {
        if (cardRef.current) {
          if (isFeedView) {
            cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          cardRef.current.classList.add("border-[#E01A76]", "shadow-[0_0_20px_rgba(224,26,118,0.2)]");
          setTimeout(() => {
            cardRef.current.classList.remove("border-[#E01A76]", "shadow-[0_0_20px_rgba(224,26,118,0.2)]");
          }, 3000);
        }
      }, 300); 
    }
  }, [searchParams, urlParamId, post._id]);

  useEffect(() => {
    const urlHighlight = searchParams.get("highlight");
    const targetWord = propHighlight || urlHighlight; 

    if (targetWord && deck && deck.length > 0) {
      const targetIdx = deck.findIndex(
        v => v.word?.toLowerCase().trim() === targetWord.toLowerCase().trim()
      );

      if (targetIdx !== -1) {
        const timer = setTimeout(() => {
          handleWordSelect(targetIdx);
        }, 300); 
        return () => clearTimeout(timer);
      }
    }
  }, [propHighlight, searchParams, deck, handleWordSelect]);

  const currentVocab = deck[currentVocabIdx] || deck[0];
  const isSaved = post.savedBy?.includes(userEmail); 
  
  const isVoted = useMemo(() => {
    if (!userEmail || !currentVocab) return false;
    const normalizedEmail = userEmail.toLowerCase().trim();
    return currentVocab.votedBy?.some(e => e.toLowerCase().trim() === normalizedEmail);
  }, [currentVocab, userEmail]);

  const userLevel = currentVocab.wordStats?.find((v) => v.email === userEmail)?.level; 

  const handleVote = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Please login first! 🔑");
    const toastId = toast.loading("Syncing...");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/vote-word/${post._id}/${currentVocab._id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) { 
        toast.success("Vibe Matched! 🔥", { id: toastId }); 
        onRefresh(); 
      } else { toast.error("Sync failed.", { id: toastId }); }
    } catch (err) { toast.error("Error!", { id: toastId }); }
  };

  const handleStatUpdate = async (e, level) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login required!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/update-word-stat/${post._id}/${currentVocab._id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ level, email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success(`${level.toUpperCase()} set!`); }
    } catch (err) { toast.error("Error!"); }
  };

  const handleShare = async (e) => {
    if (e) e.stopPropagation();
    const wordName = currentVocab.word.replace(/"/g, '');
    const shareUrl = `${window.location.origin}/post/${post._id}?highlight=${encodeURIComponent(wordName)}`;
    
    if (navigator.share) await navigator.share({ title: `Learn ${wordName}`, url: shareUrl });
    else { navigator.clipboard.writeText(shareUrl); toast.success("Copied! 📋"); }
  };

  const handleSavePost = async (e) => {
    if (e) e.stopPropagation();
    if (!userEmail) return toast.error("Login required!");
    try {
      const res = await fetch(`${API_URL}/api/english-posts/save/${post._id}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail })
      });
      if (res.ok) { onRefresh(); toast.success("Saved to Collection! 📥"); }
    } catch (err) { toast.error("Error!"); }
  };

  // 🔥 RENDER MEDIA EK DUM ORIGINAL JAISE TUMNE BHEJA THA 🔥
  const renderMediaInternal = () => {
    if (mediaItems.length === 0) return null;
    const isAnyVideoPlaying = playingIndex[post._id] !== undefined;

    const currentPillMediaCount = mediaItems.filter(m => m.vocabIndex === currentVocabIdx).length;
    const firstSlideOfCurrentPill = slideToVocabMap.indexOf(currentVocabIdx);
    const localSlideIndex = globalSlideIndex - firstSlideOfCurrentPill;

    return (
      <div 
        className="relative group w-full bg-gray-50 border-y border-gray-100 overflow-hidden" 
        onDoubleClick={handleVote}
        onMouseEnter={triggerDotsVisibility}
      >
        <div className="absolute top-3 right-3 z-[2] bg-white/90 backdrop-blur-sm border border-gray-200 px-3 py-1 rounded-xl pointer-events-none shadow-sm">
          <p className="text-[10px] font-playful font-bold text-[#8B004A] tracking-wider">{currentVocabIdx + 1} / {deck.length}</p>
        </div>

        {mediaItems.length > 1 && isAnyVideoPlaying && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-[60] pointer-events-none animate-in fade-in duration-300">
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slidePrev(); triggerDotsVisibility(); }} className="pointer-events-auto w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#8B004A] border border-gray-200 shadow-md active:scale-95 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" /></svg></button>
            <button onClick={(e) => { e.stopPropagation(); swiperRef.current?.slideNext(); triggerDotsVisibility(); }} className="pointer-events-auto w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#8B004A] border border-gray-200 shadow-md active:scale-95 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" /></svg></button>
          </div>
        )}

        <Swiper 
          onSwiper={(s) => {
            swiperRef.current = s;
            setGlobalSlideIndex(s.activeIndex);
            triggerDotsVisibility(); // Component load hote hi dots dikhao
          }}
          modules={[]} 
          autoHeight={true} 
          onTouchStart={triggerDotsVisibility} // 🔥 SWIPE SHURU HOTE HI DOTS DIKHENGE
          onSliderMove={triggerDotsVisibility} // 🔥 SWIPE KE WAQT BHI DIKHENGE
          onSlideChange={(s) => {
            const item = mediaItems[s.activeIndex];
            if (item) setCurrentVocabIdx(item.vocabIndex);
            setGlobalSlideIndex(s.activeIndex);
            setPlayingIndex({}); 
            triggerDotsVisibility(); // 🔥 SLIDE CHANGE HONE PE DOTS DIKHENGE PHIR GAYAB HONGE
          }}
          className="w-full flex items-center justify-center"
        >
          {mediaItems.map((item, idx) => {
            let videoId = "";
            if (item?.url && (item.url.includes('youtube.com') || item.url.includes('youtu.be'))) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
                const match = item.url.match(regExp);
                videoId = (match && match[2].length === 11) ? match[2] : null;
            }
            const isPlaying = playingIndex[post._id] === idx;

            return (
              <SwiperSlide key={idx} className="bg-gray-100 flex items-center justify-center w-full">
                {(item?.type === 'video' || videoId) ? (
                  <div className="w-full aspect-[4/5] max-h-[550px] relative bg-black flex items-center justify-center">
                    {isPlaying ? (
                      <iframe className="w-full h-full border-0" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`} allow="autoplay; encrypted-media" allowFullScreen></iframe>
                    ) : (
                      <div className="relative w-full h-full flex items-center justify-center cursor-pointer group" onClick={() => { setPlayingIndex({[post._id]: idx}); triggerDotsVisibility(); }}>
                        <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="video-thumb" />
                        <div className="absolute w-14 h-14 bg-[#E01A76]/90 backdrop-blur-sm border-2 border-white/80 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play fill="white" className="w-6 h-6 ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full bg-[#f8f9fa] flex items-center justify-center max-h-[600px]">
                    <img src={item?.url || post.image} className="w-full h-auto max-h-[580px] object-contain" alt="content" />
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* 🔥 OPACITY TRANSITION WALE FADING DOTS 🔥 */}
        {currentPillMediaCount > 1 && (
          <div className={`absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1.5 z-[10] pointer-events-none transition-opacity duration-700 ${showDots ? 'opacity-100' : 'opacity-0'}`}>
            {Array.from({ length: currentPillMediaCount }).map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full shadow-sm ${
                  localSlideIndex === i
                    ? 'w-6 h-1.5 bg-[#FFB800] border border-[#8B004A]/30' 
                    : 'w-1.5 h-1.5 bg-white/90 border border-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div ref={cardRef} id={post._id} className="mb-10 mx-auto w-full max-w-[440px] bg-white border border-gray-200 rounded-[2rem] shadow-sm hover:shadow-md font-body transition-all duration-300 overflow-hidden">
      
      {/* 1. HEADER */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B004A] to-[#E01A76] flex items-center justify-center text-sm font-playful font-bold text-white shadow-sm">
            {post.userEmail?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[14px] font-playful font-bold text-gray-900 tracking-wide leading-none mb-1">
              {post.userEmail?.split("@")[0]}
            </span>
            {post.title ? (
              <span className="text-[10px] font-playful text-[#8B004A] font-bold uppercase tracking-wider leading-none">
                {post.title}
              </span>
            ) : (
              <span className="text-[10px] font-playful text-gray-400 font-bold uppercase tracking-wider leading-none">
                Vocabulary Profile
              </span>
            )}
          </div>
        </div>
        <div className="px-3 py-1 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg text-[9px] text-[#8B004A] font-playful font-bold tracking-wider uppercase">
          {post.badgeName || "NORMAL"}
        </div>
      </div>

      {/* 2. MEDIA CONTAINER */}
      {renderMediaInternal()}

      {/* 3. INTERACTION BAR (🔥 UPDATED LIKES & COMMENTS UI 🔥) */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-6 text-gray-800">
          
          {/* Likes with Count */}
          <button onClick={handleVote} className={`flex items-center gap-1.5 transition-transform active:scale-90 ${isVoted ? "text-[#E01A76]" : "hover:text-[#8B004A]"}`}>
            <Heart className="w-[26px] h-[26px]" fill={isVoted ? "currentColor" : "none"} strokeWidth="2.5" />
            <span className="text-[15px] font-playful font-bold">{currentVocab.voteCount || 0}</span>
          </button>
          
          {/* Comments with Count */}
          <button onClick={() => setShowComments(true)} className="flex items-center gap-1.5 transition-transform active:scale-90 hover:text-[#8B004A]">
             <MessageCircle className="w-[26px] h-[26px]" strokeWidth="2.5" />
             <span className="text-[15px] font-playful font-bold">{post.comments?.length || 0}</span>
          </button>
          
          {/* Share */}
          <button onClick={handleShare} className="flex items-center gap-1.5 transition-transform active:scale-90 hover:text-[#8B004A]">
             <Share2 className="w-[24px] h-[24px]" strokeWidth="2.5" />
          </button>
          
          {/* Stats Button */}
          <button onClick={() => setShowStats(!showStats)} className={`flex items-center gap-1.5 transition-transform active:scale-90 ${showStats ? "text-[#FFB800]" : "hover:text-[#8B004A]"}`}>
             <Sparkles className="w-[24px] h-[24px]" strokeWidth="2.5" />
          </button>
        </div>
        
        <button onClick={handleSavePost} className={`transition-transform active:scale-90 ${isSaved ? "text-[#8B004A]" : "text-gray-300 hover:text-[#8B004A]"}`}>
          <Bookmark className="w-[26px] h-[26px]" fill={isSaved ? "currentColor" : "none"} strokeWidth="2.5" />
        </button>
      </div>

      {/* 4. EXPANDABLE STATS */}
      <div className={`transition-all duration-300 overflow-hidden ${showStats ? "max-h-[200px] opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"}`}>
        <div className="px-5">
          <div className="grid grid-cols-4 gap-2 bg-[#f8f9fa] p-2 rounded-xl border border-gray-100">
            {['easy', 'hard', 'heard', 'dailyUse'].map((lvl) => (
              <button 
                key={lvl} 
                onClick={(e) => handleStatUpdate(e, lvl)} 
                className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all active:scale-95 ${userLevel === lvl ? "bg-[#8B004A] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"}`}
              >
                <span className="text-[14px] font-playful font-bold mb-0.5">{currentVocab.commandStats?.[lvl] || 0}</span>
                <span className="text-[9px] font-playful font-bold uppercase tracking-wider">{lvl === 'dailyUse' ? 'Daily' : lvl}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WORD PILLS (Subtle tabs) */}
      {deck.length > 1 && (
        <div className="px-5 mb-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {deck.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => handleWordSelect(idx)} 
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-playful font-bold transition-all active:scale-95 ${currentVocabIdx === idx ? "bg-[#8B004A] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {item.word}
            </button>
          ))}
        </div>
      )}

      {/* 🚀 6. FLASHCARD (Clean, with soft shadow) 🚀 */}
      <div className="px-5 mb-4 perspective-[1000px] flex justify-start">
        <motion.div 
          className="cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-[1.2rem] relative inline-flex items-center justify-center px-5 py-3 min-w-[140px] min-h-[65px] active:scale-[0.98] transition-all"
          
          onViewportEnter={() => {
            if (!hasHintPlayed) {
              setHasHintPlayed(true);
              setIsFlipped(true); 
              setTimeout(() => setIsFlipped(false), 800); 
            }
          }}
          onViewportLeave={() => setHasHintPlayed(false)}
          viewport={{ once: false, amount: 0.5 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className="absolute top-1.5 right-2 flex items-center gap-1 opacity-40">
             <RefreshCcw size={10} className="text-gray-500" />
             <span className="text-[7px] font-playful font-bold uppercase tracking-widest text-gray-500">Tap</span>
          </div>

          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex items-center gap-3 mt-1.5"
              >
                <h3 className="text-[1.6rem] leading-none font-playful font-bold text-[#8B004A] tracking-tight capitalize">
                  {currentVocab.word}
                </h3>
                <div onClick={(e) => e.stopPropagation()}>
                  <PremiumSoundFeature isPremiumUser={isPremiumUser} userEmail={userEmail}>
                    <button onClick={() => speakWord(currentVocab.word)} className="text-[#FFB800] hover:bg-[#FFB800] hover:text-white transition-colors active:scale-90 bg-[#FFB800]/10 p-1.5 rounded-full">
                      <Volume2 size={16} strokeWidth={2.5} />
                    </button>
                  </PremiumSoundFeature>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center mt-1 w-full"
              >
                <span className="text-[10px] font-playful font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {currentVocab.word}
                </span>
                <p className="text-[1.1rem] text-[#8B004A] font-body font-bold leading-relaxed text-center px-2">
                  {highlightText(currentVocab.meaning, currentVocab.word)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🚀 6.5 SENTENCE BUBBLE (Clean layout) 🚀 */}
      {currentVocab.sentence && (
        <div className="px-5 mb-4">
          <div className="p-3 bg-[#FFB800]/5 rounded-xl border-l-4 border-[#FFB800] w-full text-left">
            <p className="text-[13px] text-gray-700 font-body font-medium leading-relaxed italic">
              "{highlightText(currentVocab.sentence, currentVocab.word)}"
            </p>
          </div>
        </div>
      )}

      {/* 🔥 7. COMMENTS SECTION (UPDATED FOR IMAGE COMMENTS) 🔥 */}
      <div className="px-5 mt-2 pt-3 border-t border-gray-50 pb-5">
        <button onClick={() => setShowComments(true)} className="text-[13px] font-playful font-bold text-gray-500 mb-1 hover:text-[#E01A76] transition-colors">
          View all {post.comments?.length || 0} comments
        </button>
        
        <div className={`text-[13px] font-body transition-opacity duration-500 flex items-center gap-1.5 h-[20px] overflow-hidden ${commentFade ? 'opacity-100' : 'opacity-0'}`}>
          <span className="font-bold text-gray-900 whitespace-nowrap shrink-0">
            {displayComments[activeCommentIdx]?.name}
          </span>
          <span className="text-gray-600 truncate font-medium flex items-center gap-1">
            {displayComments[activeCommentIdx]?.text ? (
              <>
                {displayComments[activeCommentIdx].text}
                {displayComments[activeCommentIdx].image && <span className="opacity-60 text-[10px]">📷</span>}
              </>
            ) : displayComments[activeCommentIdx]?.image ? (
              <span className="italic opacity-80 flex items-center gap-1">
                <span className="text-[10px]">📷</span> Shared an image
              </span>
            ) : (
              ""
            )}
          </span>
        </div>
      </div>

      {showComments && <CommentModal post={post} activeVocab={currentVocab} userEmail={userEmail} API_URL={API_URL} onClose={() => setShowComments(false)} onRefresh={onRefresh} />}
    </div>
  );
}